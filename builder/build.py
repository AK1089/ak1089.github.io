from pathlib import Path
import markdown
import yaml
from sys import argv
from extensions.code import CodeFormatter
from extensions.image import ImageFormatter
from extensions.downloads import DownloadFormatter
from extensions.spoiler import SpoilerFormatter
from extensions.blockquote import BlockquoteFormatter


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
        root = Path(__file__).resolve().parent.parent

        relative_path = path.relative_to(root)
                
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
            f'<a href="/" class="path-link">home</a> <span class="separator"> / </span>'
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


# main function to build the site
def build_site():

    # read the base template and store it in a variable
    with open("assets/templates/base.html", "r") as f:
        template = f.read()

    # find all markdown files in the current directory (recursively) and build them into HTML
    for md_path in Path(".").rglob("*.md"):
        # skip node_modules and other excluded directories
        if "node_modules" in md_path.parts:
            continue
        success = build_file(template, md_path.resolve())
        print(f"Built: {md_path}" if success else f"Skipped: {md_path}")


def build_file(template: str, md_path: Path, force: bool = False) -> bool:
    with open(md_path, "r") as f:
        md_content = f.read()

    # path to a new file with the same name, but a .html extension
    html_path = md_path.with_suffix(".html")

    # skip conversion if HTML exists and is newer than MD file (for manual edits)
    if (
        not force
        and html_path.exists()
        and html_path.stat().st_mtime > md_path.stat().st_mtime
    ):
        return False

    # parse frontmatter and content
    frontmatter, content = parse_markdown_with_frontmatter(md_content)
    try:
        metadata = HeaderMetadata(md_path, frontmatter)
    except AssertionError as e:
        print(f"Error processing {md_path}: {e}")
        raise

    # convert markdown and add header
    content_html = md.convert(content)
    page_html = create_header_html(metadata) + content_html

    # insert into template
    full_page = template.replace("<!-- CONTENT_GOES_HERE -->", page_html)
    full_page = full_page.replace("<!-- TITLE_GOES_HERE -->", metadata.address_bar_title)

    # write to a .html file in the same location
    with open(html_path, "w") as f:
        f.write(full_page)

    return True


# run the build_site function if this script is run
if __name__ == "__main__":
    md = markdown.Markdown(extensions=[
        "fenced_code",
        "tables",
        "nl2br",
        "sane_lists",
        "smarty",
        "markdown_katex",
        BlockquoteFormatter(),
        CodeFormatter(),
        ImageFormatter(),
        DownloadFormatter(),
        SpoilerFormatter()
    ])

    if len(argv) == 1:
        build_site()

    else:
        with open("assets/templates/base.html", "r") as f:
            template = f.read()

        for arg in argv[1:]:
            build_file(template, Path(arg), force=True)
            print(f"Force built: {arg}")
