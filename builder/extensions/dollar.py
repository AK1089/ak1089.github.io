"""Rewrite $...$ and $$...$$ into markdown-katex syntax.

    $x$            ->  $`x`$
    $$ (own line)  ->  ```math fence
    \\$            ->  literal $

Code spans and code fences are left alone. Quote and environment fences
contain prose, so formulas inside them is still rewritten.
"""

import re

from extensions.environments import ENV_TYPES

_FENCE = re.compile(r"^(\s*)(`{3,}|~{3,})\s*(\S*)")
_DISPLAY = re.compile(r"^(\s*)\$\$(.*?)(\$\$)?\s*$")
# Code spans, including existing $`...`$ formulas, which must not be touched.
_CODE_SPAN = re.compile(r"\$?(`+).+?(?<!`)\1(?!`)\$?")
# An escaped dollar, or a formula. Pandoc's rule for formulas: no space just
# inside the dollars, no digit right after.
_INLINE = re.compile(r"\\\$|(?<![\\$])\$(?![\s$])(.+?)(?<![\s\\])\$(?![\d$])")


def _is_prose_fence(info: str) -> bool:
    return info.startswith("quote-") or info in ENV_TYPES


def _rewrite_inline(text: str) -> str:
    def to_katex(m: re.Match) -> str:
        tex = m.group(1)
        if tex is None:
            return "$"
        return f"$``{tex}``$" if "`" in tex else f"$`{tex}`$"

    return _INLINE.sub(to_katex, text)


def _rewrite_line(line: str) -> str:
    parts, pos = [], 0
    for m in _CODE_SPAN.finditer(line):
        parts += [_rewrite_inline(line[pos:m.start()]), m.group(0)]
        pos = m.end()
    parts.append(_rewrite_inline(line[pos:]))
    return "".join(parts)


def rewrite_dollars(text: str) -> str:
    out = []
    code_close = None  # closing marker while inside a code fence
    prose_depth = 0  # open quote/environment fences
    display_indent = None  # indent while inside a $$ block

    for line in text.split("\n"):
        if code_close is not None:
            if line.strip() == code_close:
                code_close = None
            out.append(line)
            continue

        if display_indent is not None:
            if line.strip() == "$$":
                out.append(display_indent + "```")
                display_indent = None
            else:
                out.append(line)
            continue

        fence = _FENCE.match(line)
        if fence:
            indent, marker, info = fence.groups()
            if _is_prose_fence(info):
                prose_depth += 1
            elif not info and prose_depth:
                prose_depth -= 1
            else:
                code_close = marker
            out.append(line)
            continue

        display = _DISPLAY.match(line)
        if display:
            indent, tex, closed = display.groups()
            out.append(indent + "```math")
            if tex.strip():
                out.append(indent + tex.strip())
            if closed:
                out.append(indent + "```")
            else:
                display_indent = indent
            continue

        out.append(_rewrite_line(line))

    return "\n".join(out)
