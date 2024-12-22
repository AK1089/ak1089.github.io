from markdown.extensions import Extension
from markdown.preprocessors import Preprocessor
from markdown.postprocessors import Postprocessor
import re


class ImageFormatter(Extension):
    def extendMarkdown(self, md):
        md.postprocessors.register(
            ImageWrapper(md), "image_wrapper", 25
        )

class ImageWrapper(Postprocessor):
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
            
            # Create figure element
            return (
                f'<figure>'
                f'<img alt="{alt}" src="{src}" />'
                f'<figcaption>{title}</figcaption>'
                f'</figure>'
            )

        # Pattern matches a paragraph containing just an image
        pattern = r'<p><img[^>]+/></p>'
        return re.sub(pattern, replace_image, text)