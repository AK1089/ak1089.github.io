from markdown.extensions import Extension
from markdown.preprocessors import Preprocessor
from markdown.postprocessors import Postprocessor
import re


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
                    wrapped_lines.append("<span></span>")

            wrapped_code = "\n".join(wrapped_lines)

            # Create copy button with sprite icon
            copy_button = (
                '<button class="copy-button" onclick="copyCode(this)" '
                'aria-label="Copy code to clipboard">'
                '<svg class="icon icon--stroke" width="24" height="24">'
                '<use href="/assets/icons/sprite.svg#copy"></use>'
                '</svg>'
                '</button>'
            )

            return (
                f'<pre data-language="{lang}">'
                f'{copy_button}'
                f'<code class="language-{lang}">{wrapped_code}</code>'
                f'</pre>'
            )

        # More specific pattern that handles the actual structure
        pattern = r'<pre><code class="language-([^"]*)">(.*?)</code></pre>'
        altered = re.sub(pattern, replace_code_block, text, flags=re.DOTALL)
        altered = altered.replace("<span></span></code>", "</code>").replace("\n", "")

        return altered