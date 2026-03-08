from markdown.extensions import Extension
from markdown.postprocessors import Postprocessor
from pathlib import Path
import re
import html


class ImageFormatter(Extension):
    def extendMarkdown(self, md):
        md.postprocessors.register(
            ImageWrapper(md), "image_wrapper", 25
        )

class ImageWrapper(Postprocessor):
    @staticmethod
    def _is_local_source(src: str) -> bool:
        return not (
            src.startswith("http://")
            or src.startswith("https://")
            or src.startswith("data:")
            or src.startswith("//")
        )

    def _build_responsive_attrs(self, src: str) -> str:
        if not self._is_local_source(src):
            return ""
        if not src.lower().endswith(".avif"):
            return ""

        source_dir = getattr(self.md, "current_source_dir", None)
        if source_dir is None:
            return ""

        src_path = Path(src)
        stem = src_path.stem
        suffix = src_path.suffix

        candidates = []
        for variant in source_dir.glob(f"{stem}-*{suffix}"):
            width_token = variant.stem.rsplit("-", 1)[-1]
            if width_token.isdigit():
                rel_variant = variant.relative_to(source_dir).as_posix()
                candidates.append((int(width_token), rel_variant))

        if not candidates:
            return ""

        candidates.sort()
        srcset = ", ".join(f"{path} {width}w" for width, path in candidates)
        return (
            f' srcset="{srcset}"'
            f' sizes="(max-width: 900px) 100vw, 768px"'
        )

    def run(self, text):
        def replace_image(match):
            whole_tag = match.group(0)
            
            # Extract attributes using regex
            alt_match = re.search(r'alt="([^"]*)"', whole_tag)
            src_match = re.search(r'src="([^"]*)"', whole_tag)
            title_match = re.search(r'title="([^"]*)"', whole_tag)
            
            alt = alt_match.group(1) if alt_match else ""
            src = src_match.group(1) if src_match else ""
            title = title_match.group(1) if title_match else alt  # Use alt as fallback caption

            alt_escaped = html.escape(html.unescape(alt), quote=True)
            src_escaped = html.escape(src, quote=True)
            title_escaped = html.escape(html.unescape(title))
            responsive_attrs = self._build_responsive_attrs(src)
            
            # Create figure element
            return (
                f'<figure>'
                f'<img alt="{alt_escaped}" src="{src_escaped}"'
                f'{responsive_attrs} loading="lazy" decoding="async" />'
                f'<figcaption>{title_escaped}</figcaption>'
                f'</figure>'
            )

        # Pattern matches a paragraph containing just an image
        pattern = r'<p><img[^>]+/></p>'
        return re.sub(pattern, replace_image, text)
