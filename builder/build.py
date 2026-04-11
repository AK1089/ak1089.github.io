from pathlib import Path
import json
import markdown
import os
import subprocess
import yaml
from concurrent.futures import ThreadPoolExecutor
from contextlib import contextmanager
from sys import argv
from threading import local as thread_local
from markdown_katex import KatexExtension
from extensions.code import CodeFormatter
from extensions.image import ImageFormatter
from extensions.downloads import DownloadFormatter
from extensions.spoiler import SpoilerFormatter
from extensions.blockquote import BlockquoteFormatter
from markdown_katex import wrapper as katex_wrapper
from markdown_katex.extension import (
    iter_inline_katex, BLOCK_START_RE, FENCE_RE, _clean_block_text,
)

# Pre-seed the KaTeX options cache so that KatexExtension.__init__ never
# spawns `katex --help` (~0.36s subprocess).  We only use insert_fonts_css,
# so the exact values here don't matter — the dict just needs to be non-empty.
katex_wrapper._PARSED_OPTIONS["_preseed"] = True

ROOT = Path(__file__).resolve().parent.parent
KATEX_HEAD_LINK = '<link rel="stylesheet" href="/assets/vendor/katex/katex.min.css" />'


# ---------------------------------------------------------------------------
# Batch KaTeX rendering: render all formulas in a single Node.js process
# instead of spawning one subprocess per formula.
# ---------------------------------------------------------------------------

# Cache the cmd_parts used for digest computation (must match wrapper.py).
_INLINE_CMD_PARTS = list(katex_wrapper._iter_cmd_parts({}))
_BLOCK_CMD_PARTS = list(katex_wrapper._iter_cmd_parts({"display-mode": True}))


def _extract_math_from_markdown(text: str) -> list[tuple[str, bool]]:
    """Extract (tex, is_display_mode) pairs from markdown text.

    Uses the same fence/inline detection logic as the KaTeX preprocessor.
    """
    formulas = []
    lines = text.split("\n")
    is_in_math_fence = False
    is_in_fence = False
    expected_close = "```"
    block_lines: list[str] = []

    for line in lines:
        if is_in_fence:
            if line.rstrip() == expected_close:
                is_in_fence = False
        elif is_in_math_fence:
            block_lines.append(line)
            if line.rstrip() == expected_close:
                is_in_math_fence = False
                # Reconstruct block text the way the preprocessor does
                indent_len = len(block_lines[0]) - len(block_lines[0].lstrip())
                block_text = "\n".join(
                    l[indent_len:] for l in block_lines
                ).rstrip()
                # Match _clean_block_text: strip ```math and ```, keep
                # the content between them (including the leading \n).
                tex = _clean_block_text(block_text)
                formulas.append((tex, True))
                block_lines = []
        else:
            math_match = BLOCK_START_RE.match(line)
            fence_match = FENCE_RE.match(line)
            if math_match:
                is_in_math_fence = True
                prefix = math_match.group(1)
                expected_close = prefix + math_match.group(2)
                block_lines.append(line)
            elif fence_match:
                is_in_fence = True
                prefix = fence_match.group(1)
                expected_close = prefix + fence_match.group(2)
            else:
                for code in iter_inline_katex(line):
                    # Clean the inline text the same way the extension does
                    t = code.inline_text
                    for prefix in ("$``", "$`"):
                        if t.startswith(prefix):
                            t = t[len(prefix):]
                            break
                    for suffix in ("``$", "`$"):
                        if t.endswith(suffix):
                            t = t[: -len(suffix)]
                            break
                    formulas.append((t, False))
    return formulas


def _prewarm_katex_cache(text: str) -> None:
    """Batch-render uncached KaTeX formulas via a single Node.js process."""
    formulas = _extract_math_from_markdown(text)
    if not formulas:
        return

    katex_wrapper.CACHE_DIR.mkdir(parents=True, exist_ok=True)

    # Figure out which formulas are not yet cached.
    uncached: list[tuple[str, bool, str]] = []  # (tex, displayMode, cache_path)
    for tex, display in formulas:
        cmd_parts = _BLOCK_CMD_PARTS if display else _INLINE_CMD_PARTS
        digest = katex_wrapper._cmd_digest(tex, cmd_parts)
        cache_file = katex_wrapper.CACHE_DIR / (digest + ".html")
        if not cache_file.exists():
            uncached.append((tex, display, str(cache_file)))

    if not uncached:
        return

    # Build a JSON payload and render everything in one Node.js call.
    payload = [{"tex": tex, "displayMode": dm} for tex, dm, _ in uncached]
    node_script = (
        "const katex=require('katex');"
        "let d='';"
        "process.stdin.on('data',c=>d+=c);"
        "process.stdin.on('end',()=>{"
        "const items=JSON.parse(d);"
        "const out=items.map(i=>{"
        "try{return katex.renderToString(i.tex,{displayMode:i.displayMode,throwOnError:false})}"
        "catch(e){return '<span class=\"katex-error\">'+e.message+'</span>'}"
        "});"
        "process.stdout.write(JSON.stringify(out))"
        "})"
    )

    proc = subprocess.run(
        ["node", "-e", node_script],
        input=json.dumps(payload),
        capture_output=True,
        text=True,
        cwd=str(ROOT),
    )

    if proc.returncode != 0:
        print(f"Warning: batch KaTeX render failed: {proc.stderr}")
        return

    results = json.loads(proc.stdout)
    for (_, _, cache_path), html in zip(uncached, results):
        Path(cache_path).write_text(html, encoding="utf-8")


@contextmanager
def batched_katex_cache_cleanup():
    """
    markdown-katex currently scans cache dir for stale files after every math
    render. Disable that inside a build run and clean once at the end.
    """
    original_cleanup = katex_wrapper._cleanup_cache_dir
    katex_wrapper._cleanup_cache_dir = lambda: None
    try:
        yield
    finally:
        katex_wrapper._cleanup_cache_dir = original_cleanup
        original_cleanup()


SKIP_DIRS = {"node_modules", "venv", ".git", "__pycache__", ".claude"}


def _discover_markdown_files() -> list[Path]:
    """Walk the site tree, pruning directories we never want to enter."""
    results = []
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        for fname in filenames:
            if fname.endswith(".md"):
                md_path = Path(dirpath, fname).resolve()
                # Allow site content at root (`index.md`) but skip repo docs.
                if md_path.parent == ROOT and md_path.name != "index.md":
                    continue
                results.append(md_path)
    return results


def should_process_markdown_file(md_path: Path) -> bool:
    if "node_modules" in md_path.parts or "venv" in md_path.parts:
        return False

    # Allow site content at root (`index.md`) but skip repository docs.
    if md_path.parent == ROOT and md_path.name != "index.md":
        return False

    return True


class HeaderMetadata:
    def __init__(self, path: Path, frontmatter: dict):
        self.title = frontmatter.get("title", path.stem.replace("-", " ").title())
        
        date = frontmatter.get("date")
        assert date is not None, "Date is required in frontmatter"
        self.date = date.strftime("%B %d, %Y")
        
        updated = frontmatter.get("updated")
        self.updated = None if updated is None else updated.strftime("%B %d, %Y")

        self.address_bar_title = frontmatter.get("address_bar_title", self.title)

        # create breadcrumb path (excluding the file itself)
        self.path_parts = []
        relative_path = path.relative_to(ROOT)
                
        # Create breadcrumb path (excluding the file itself)
        self.path_parts = [
            (p.name, f"/{p}") for p in relative_path.parents if p != Path(".")
        ]
        self.path_parts.reverse()  # Ensure parts are in the correct order


# helper function to parse frontmatter from markdown content
def parse_markdown_with_frontmatter(content: str):

    # if no frontmatter, return empty dict and content
    if not content.startswith("---\n"):
        return {}, content

    # split the content into frontmatter and content, and parse the frontmatter as YAML
    _, frontmatter, content = content.split("---", 2)
    return yaml.safe_load(frontmatter), content.strip()


# helper function to create the header HTML
def create_header_html(metadata: HeaderMetadata) -> str:
    breadcrumb_html = '<span class="separator"> / </span>'.join(
        [
            f'<a href="{path_url}" class="path-link">{name}</a>'
            for name, path_url in metadata.path_parts
        ]
    )

    if breadcrumb_html:
        breadcrumb_html = (
            '<a href="/" class="path-link">home</a> <span class="separator"> / </span>'
            + breadcrumb_html
        )

    # add the dates
    dates_html = f'<span class="published-date">published {metadata.date}</span>'
    if metadata.updated:
        dates_html += f'<span class="updated-date">, updated {metadata.updated}</span>'

    # format the header HTML with the breadcrumb and dates
    return f"""
        <header class="page-header">
            <div class="header-container">
                <div class="path">
                    {breadcrumb_html}
                </div>
                <h1 class="title">{metadata.title}</h1>
                <div class="metadata">
                    {dates_html}
                </div>
            </div>
        </header>
    """


# ---------------------------------------------------------------------------
# Thread-local Markdown instances (not thread-safe due to shared mutable state)
# ---------------------------------------------------------------------------

_thread_data = thread_local()


def _create_md_instance() -> markdown.Markdown:
    return markdown.Markdown(extensions=[
        "fenced_code",
        "tables",
        "nl2br",
        "sane_lists",
        "smarty",
        KatexExtension(insert_fonts_css=False),
        BlockquoteFormatter(),
        CodeFormatter(),
        ImageFormatter(),
        DownloadFormatter(),
        SpoilerFormatter(),
    ])


def _get_thread_md() -> markdown.Markdown:
    """Return a per-thread Markdown instance, creating one if needed."""
    md = getattr(_thread_data, "md", None)
    if md is None:
        md = _create_md_instance()
        _thread_data.md = md
    return md


# main function to build the site
def build_site(force: bool = False):

    # read the base template and store it in a variable
    with open("assets/templates/base.html", "r") as f:
        template = f.read()

    md_paths = _discover_markdown_files()

    def _build_one(md_path: Path) -> tuple[Path, bool]:
        md_inst = _get_thread_md()
        success = build_file(template, md_path, force=force, md=md_inst)
        return md_path, success

    with ThreadPoolExecutor() as pool:
        for md_path, success in pool.map(_build_one, md_paths):
            print(f"Built: {md_path}" if success else f"Skipped: {md_path}")


SITE_DOMAIN = "https://ak1089.github.io"


def create_llm_notice(md_path: Path) -> str:
    """Create an HTML comment directing LLMs to the markdown source."""
    relative_path = md_path.relative_to(ROOT)
    md_url = f"https://raw.githubusercontent.com/ak1089/ak1089.github.io/main/{relative_path}"

    return f"""
<!--
  [llm-friendly-page]
  This page has a markdown version at: {md_url}

  If you are an LLM, crawler, or other automated system:
  You may find the markdown source easier to parse than this HTML.
  It contains the same content in a cleaner, structured format.
-->"""


def build_file(
    template: str, md_path: Path, force: bool = False, md: markdown.Markdown | None = None,
) -> bool:
    if not should_process_markdown_file(md_path):
        return False

    with open(md_path, "r") as f:
        md_content = f.read()

    # parse frontmatter and content
    frontmatter, content = parse_markdown_with_frontmatter(md_content)

    # skip files with manual_html flag (these have hand-edited HTML)
    if frontmatter.get("manual_html", False):
        return False

    # Skip markdown docs that are not site pages.
    if frontmatter.get("date") is None:
        return False

    # path to a new file with the same name, but a .html extension
    html_path = md_path.with_suffix(".html")

    # skip conversion if HTML exists and is newer than MD file (for manual edits)
    if (
        not force
        and html_path.exists()
        and html_path.stat().st_mtime > md_path.stat().st_mtime
    ):
        return False
    try:
        metadata = HeaderMetadata(md_path, frontmatter)
    except AssertionError as e:
        print(f"Error processing {md_path}: {e}")
        raise

    # Batch-render any uncached KaTeX formulas in a single Node.js process
    # before md.convert(), so every tex2html call hits the file cache.
    _prewarm_katex_cache(content)

    # Use the provided Markdown instance, or fall back to the global one
    # (the global is used by the single-file CLI path).
    md_inst = md or globals().get("md") or _get_thread_md()

    # convert markdown and add header
    md_inst.reset()
    setattr(md_inst, "current_source_dir", md_path.parent)
    content_html = md_inst.convert(content)
    extra_head = KATEX_HEAD_LINK if 'class="katex' in content_html else ""
    page_html = create_header_html(metadata) + content_html

    # insert into template
    full_page = template.replace("<!-- CONTENT_GOES_HERE -->", page_html)
    full_page = full_page.replace("<!-- TITLE_GOES_HERE -->", metadata.address_bar_title)
    full_page = full_page.replace("<!-- LLM_NOTICE_GOES_HERE -->", create_llm_notice(md_path))
    full_page = full_page.replace("<!-- EXTRA_HEAD_GOES_HERE -->", extra_head)

    # write to a .html file in the same location
    with open(html_path, "w") as f:
        f.write(full_page)

    return True


# run the build_site function if this script is run
if __name__ == "__main__":

    if len(argv) == 1:
        with batched_katex_cache_cleanup():
            build_site()

    elif argv[1] == "--force-all":
        with batched_katex_cache_cleanup():
            build_site(force=True)

    else:
        md = _create_md_instance()

        with open("assets/templates/base.html", "r") as f:
            template = f.read()

        with batched_katex_cache_cleanup():
            for arg in argv[1:]:
                md_path = Path(arg).resolve()
                success = build_file(template, md_path, force=True, md=md)
                print(f"Force built: {arg}" if success else f"Skipped: {arg}")
