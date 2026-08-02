import re

from markdown.extensions import Extension
from markdown.preprocessors import Preprocessor

# Boxed, numbered environments (mirroring the amsthm boxes in the PDF notes).
BOXED = {"theorem", "definition", "proposition", "example", "remark", "lemma"}
# Inline environments: a bold lead-in label, no box, no number.
INLINE = {"proof", "corollary", "note"}
ENV_TYPES = BOXED | INLINE

_START = re.compile(r"^```(" + "|".join(ENV_TYPES) + r")(?:\s+(.*\S))?\s*$")
_TITLE = re.compile(r"^(\S+)?\s*(\(.*\))?$")
_FENCE = re.compile(r"^```(\S+)")


class EnvironmentFormatter(Extension):
    def extendMarkdown(self, md):
        # Priority 600: run before the KaTeX fenced-code preprocessor (50) and
        # the HTML block preprocessor, so nested ```math blocks and the raw
        # wrapper divs are both handled downstream.
        md.preprocessors.register(
            EnvironmentPreprocessor(md), "environment_preprocessor", 600
        )


class EnvironmentPreprocessor(Preprocessor):
    def run(self, lines):
        out = []
        env = None          # current environment type, or None
        body = []
        nested = False      # inside a nested fenced block (e.g. ```math)

        for line in lines:
            start = _START.match(line) if env is None else None

            if start:
                env = start.group(1)
                body = []
                nested = False
                out.append(self._open(env, start.group(2)))
                continue

            if env is not None:
                if not nested and _FENCE.match(line):
                    nested = True
                    body.append(line)
                elif line.strip() == "```":
                    if nested:
                        nested = False
                        body.append(line)
                    else:
                        out.extend(body)
                        out.append("</div>")
                        env = None
                else:
                    body.append(line)
                continue

            out.append(line)

        return out

    def _open(self, env, suffix):
        if env in INLINE:
            return f'<div class="env-inline env--{env}" markdown="1">\n'

        label = env.capitalize()
        num, title = "", ""
        if suffix:
            m = _TITLE.match(suffix)
            num = "" if m is None else m.group(1) or ""
            title = "" if m is None else m.group(2) or ""
        head = f'<span class="env-label">{label}{(" " + num) if num else ""}</span>'
        if title:
            head += f' <span class="env-title">{title}</span>'
        return (
            f'<div class="env env--{env}" markdown="1">\n'
            f'<div class="env-head">{head}</div>\n'
        )
