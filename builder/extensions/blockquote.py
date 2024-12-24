from markdown.extensions import Extension
from markdown.preprocessors import Preprocessor
import re


class BlockquoteFormatter(Extension):
    def extendMarkdown(self, md):
        md.preprocessors.register(
            BlockquotePreprocessor(md), "blockquote_preprocessor", 500
        )


class BlockquotePreprocessor(Preprocessor):
    def run(self, lines):
        new_lines = []
        current_blockquote = None
        blockquote_content = []

        for line in lines:
            # Check for blockquote start
            quote_match = re.match(r"^```(quote-(?:info|quote|success|warning))$", line)

            if quote_match and not current_blockquote:
                # Start new blockquote
                current_blockquote = quote_match.group(1)
                continue
            elif line.strip() == "```" and current_blockquote:
                # End of blockquote - process the content
                content = " ".join(blockquote_content)

                # Create the blockquote HTML
                blockquote_html = (
                    f'<blockquote class="{current_blockquote}">\n'
                    f'    <svg class="icon icon--stroke" style="stroke-width: 2;" width="24" height="24">\n'
                    f'        <use href="/assets/icons/sprite.svg#{current_blockquote.split("-")[1]}"></use>\n'
                    f"    </svg>\n"
                    f"    {content}\n"
                    f"</blockquote>"
                )

                new_lines.append(blockquote_html)

                # Reset blockquote state
                current_blockquote = None
                blockquote_content = []
                continue

            if current_blockquote:
                # Inside a blockquote - collect content
                blockquote_content.append(line)
            else:
                # Regular line
                new_lines.append(line)

        return new_lines
