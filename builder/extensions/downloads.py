from markdown.extensions import Extension
from markdown.preprocessors import Preprocessor
import re

class DownloadFormatter(Extension):
    def extendMarkdown(self, md):
        md.preprocessors.register(
            DownloadPreprocessor(md), "download_preprocessor", 500
        )

class DownloadPreprocessor(Preprocessor):
    def run(self, lines):
        new_lines = []
        pattern = r'<download\s+([^>]+)>'
        
        for line in lines:
            # Find all download tags in the line
            matches = re.finditer(pattern, line)
            
            # Replace each match with the file download HTML
            last_end = 0
            result = ""
            
            for match in matches:
                filename = match.group(1).strip()
                result += line[last_end:match.start()]
                
                # Create the file download component
                download_html = (
                    f'<a href="{filename}" download class="file-download">\n'
                    f'    <svg><use href="/assets/icons/sprite.svg#document"></use></svg>\n'
                    f'    <span data-filename="{filename}"></span>\n'
                    f'</a>'
                )
                
                result += download_html
                last_end = match.end()
            
            # Add any remaining text after the last match
            result += line[last_end:]
            
            # If there were any matches, use the processed line
            new_lines.append(result if last_end > 0 else line)
        
        return new_lines