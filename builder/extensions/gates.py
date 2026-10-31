import html
import re

from markdown.extensions import Extension
from markdown.preprocessors import Preprocessor

# A line like "--- Let's see the solution..." or "--- Go on / Skip ahead" becomes a gate:
# everything below it stays hidden until a reader picks an option. A second option
# jumps to the later gate with the same label. /assets/scripts/gates.js does the hiding.
_GATE_RE = re.compile(r'^--- (\S.*)$')
_EMPHASIS_RE = re.compile(r'\*([^*]+)\*')


class GateFormatter(Extension):
    def extendMarkdown(self, md):
        md.preprocessors.register(GatePreprocessor(md), "gate_preprocessor", 490)


class GatePreprocessor(Preprocessor):
    def run(self, lines):
        new_lines = []
        first = True

        for line in lines:
            match = _GATE_RE.match(line)
            if not match:
                new_lines.append(line)
                continue

            options = [label.strip() for label in match.group(1).split(" / ")]
            buttons = "".join(
                f'<button type="button" class="gate-option">{_label_html(label)}</button>'
                for label in options
            )
            gate_html = (
                f'<div class="gate">{buttons}'
                f'<button type="button" class="gate-all">Show everything</button></div>'
            )
            if first:
                gate_html += '<script src="/assets/scripts/gates.js" defer></script>'
                first = False

            new_lines.append(gate_html)

        return new_lines


def _label_html(label):
    return _EMPHASIS_RE.sub(r'<em>\1</em>', html.escape(label))
