from markdown.extensions import Extension
from markdown.postprocessors import Postprocessor
import re

_CODE_BLOCK_RE = re.compile(
    r'<pre><code class="language-([^"]*)">(.*?)</code></pre>', re.DOTALL
)


class CodeFormatter(Extension):
    def extendMarkdown(self, md):
        md.postprocessors.register(
            CodeLineWrapper(md), "code_line_wrapper", 25
        )


class CodeLineWrapper(Postprocessor):
    def run(self, text):
        def replace_code_block(match):
            code = match.group(2)
            lang = match.group(1) or ""

            # Split, wrap lines, and handle empty lines
            wrapped_lines = []
            for line in code.split("\n"):
                if line:
                    wrapped_lines.append(f"<span>{line}</span>")
                else:
                    wrapped_lines.append("<span>&nbsp;</span>")

            wrapped_code = "\n".join(wrapped_lines)

            # Language badge doubles as copy button
            badge = (
                f'<span class="lang-badge" onclick="copyCode(this)">{lang}</span>'
            )

            return (
                f'<pre>'
                f'{badge}'
                f'<code class="language-{lang}">{wrapped_code}</code>'
                f'</pre>'
            )

        altered = _CODE_BLOCK_RE.sub(replace_code_block, text)
        altered = altered.replace("<span>&nbsp;</span></code>", "</code>").replace("\n", "")

        return altered