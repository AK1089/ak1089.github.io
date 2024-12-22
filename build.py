from pathlib import Path
import markdown
import yaml


class HeaderMetadata:
    def __init__(self, path: Path, frontmatter: dict):
        self.title = frontmatter.get("title", path.stem.replace("-", " ").title())
        self.date = frontmatter.get("date").strftime("%B %d, %Y")
        self.updated = (
            frontmatter.get("updated").strftime("%B %d, %Y")
            if "updated" in frontmatter
            else None
        )

        # create breadcrumb path (excluding the file itself)
        self.path_parts = []
        current = path.parent
        root = Path(".")
        parts = []

        # traverse up the path until we reach the root
        while current != root and current != Path("/"):
            parts.append(current)
            current = current.parent

        # reverse the parts so we start from the root
        self.path_parts = [(p.name, "/".join(p.parts)) for p in reversed(parts)]


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
    breadcrumb_html = '<span class="separator"> • </span>'.join(
        [f'<a href="/{path_url}" class="path-link">{name}</a>' for name, path_url in metadata.path_parts]
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
    md = markdown.Markdown(extensions=["fenced_code", "tables"])

    with open("assets/templates/base.html", "r") as f:
        template = f.read()

    # find all markdown files in the current directory (recursively) and read them
    for md_path in Path(".").rglob("*.md"):
        with open(md_path, "r") as f:
            md_content = f.read()

        # path to a new file with the same name, but a .html extension
        html_path = md_path.with_suffix(".html")

        # skip conversion if HTML exists and is newer than MD file (for manual edits)
        if html_path.exists() and html_path.stat().st_mtime > md_path.stat().st_mtime:
            continue

        # parse frontmatter and content
        frontmatter, content = parse_markdown_with_frontmatter(md_content)
        metadata = HeaderMetadata(md_path, frontmatter)

        # convert markdown and add header
        content_html = md.convert(content)
        page_html = create_header_html(metadata) + content_html

        # insert into template
        full_page = template.replace("<!-- CONTENT_GOES_HERE -->", page_html)

        # write to a .html file in the same location
        with open(html_path, "w") as f:
            f.write(full_page)

        # log the conversion
        print(f"Built: {md_path} -> {html_path}")


# run the build_site function if this script is run
if __name__ == "__main__":
    build_site()
