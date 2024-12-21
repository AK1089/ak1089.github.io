from pathlib import Path
import markdown

def build_site():
    md = markdown.Markdown(extensions=['fenced_code', 'tables'])
    
    with open('assets/templates/base.html', 'r') as f:
        template = f.read()
    
    # find all markdown files in the current directory (recursively) and read them
    for md_path in Path('.').rglob('*.md'):
        with open(md_path, 'r') as f:
            md_content = f.read()
        
        # path to a new file with the same name, but a .html extension
        html_path = md_path.with_suffix('.html')
        
        # skip conversion if HTML exists and is newer than MD file (for manual edits)
        if html_path.exists() and html_path.stat().st_mtime > md_path.stat().st_mtime:
            continue
        
        # convert to HTML and insert into the template
        full_page = template.replace('<!-- CONTENT_GOES_HERE -->', md.convert(md_content))
        
        # write to a .html file in the same location
        with open(html_path, 'w') as f:
            f.write(full_page)
        
        # log the conversion
        print(f"Built: {md_path} -> {html_path}")

# run the build_site function if this script is run
if __name__ == '__main__':
    build_site()
