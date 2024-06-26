from os import path, walk
import re
from sys import argv

# Function which writes the contents of a custom-syntax file to HTML
def convert_markdown_to_html(input_file, output_file, depth):
    with open(input_file, 'r') as f:
        content = f.read()

    with open("templates/template.html", 'r') as f:
        html_content = f.read()

    # Some basic colours for colour tags
    color_dict = {
        "red": "#FF0000",
        "blue": "#0000FF"
    }

    # Ignore commented lines
    content = re.sub(r'\/\*.*\*\/', "", content, flags=re.MULTILINE)

    # Replace line breaks with paragraph tags
    content = content.replace('\n\n', '</p>\n<p>')
    content = f'<p>{content}</p>\n'

    # Convert markdown headers to HTML headers
    for i in range(6, 0, -1):
        content = re.sub(('#' * i) + r' (.+)$', lambda match: '<h{0} id="{2}">{1}</h{0}>'.format(i, match.group(1), re.sub(r'[^a-zA-Z0-9]+', '-', match.group(1).lower())[:-3]), content, flags=re.MULTILINE)

    # Custom markdown to HTML conversions
    content = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', content)
    content = re.sub(r'\*(.*?)\*', r'<em>\1</em>', content)
    content = re.sub(r'__(.*?)__', r'<u>\1</u>', content)
    content = re.sub(r'\[\&(.+?)\]\((.+?)\)', r'<div class="image-container"><img src="\2" alt="\1"><div class="caption">\1</div></div>', content)
    content = re.sub(r'\[([^\]]*)\]\(!(.+?)\)', r'<span class="tooltip">\1<span class="tooltiptext">\2</span></span>', content)
    content = re.sub(r'\[([^\]]*)\]\((.*?)\)', r'<a href="\2">\1</a>', content)
    content = re.sub(r'<slider-(on|off)\s+([^>]+)>', lambda m: f'<label class="switch"> <input type="checkbox" id="{m.group(2)}" onclick="on_slider_toggle(\'{m.group(2)}\')" {"checked" if m.group(1) == "on" else ""}> <span class="slider"></span> </label>', content)

    # Color tags
    for color, hex_value in color_dict.items():
        content = re.sub(r'<&{}>(.*?)</&{}>'.format(color, color), r'<span style="color:{};">\1</span>'.format(hex_value), content)

    # Info box
    def info_box_replacer(match):
        primary_color = match.group(1)
        secondary_color = match.group(2)
        info_content = match.group(3)
        return f'<div class="info-box" style="--primary-color: #{primary_color}; --secondary-color: #{secondary_color};">{info_content}</div>'

    content = re.sub(r'"""info #([A-Fa-f0-9]{6}) #([A-Fa-f0-9]{6})\n(.*?)\n"""', info_box_replacer, content, flags=re.DOTALL)

    # Code blocks
    def code_block_replacer(match):
        language = match.group(1)
        code = match.group(2)
        code_lines = code.split('\n')
        formatted_code = ''.join(f'<span>{line}</span>\n' for line in code_lines[:-1])
        return f'''
        <pre style="position: relative;">
            <button class="copy-button" onclick="copyToClipboard(this)">Copy</button>
            <code data-language="{language}" class="line-numbers">{formatted_code}</code>
        </pre>'''

    content = re.sub(r'```(\S*)\n(.*?)```', code_block_replacer, content, flags=re.DOTALL)

    # Inline code
    content = re.sub(r'`([^`]+)`', r'<code class="inline-code">\1</code>', content)

    # List elements
    content = re.sub(r'^- (.+)$', r'<li>\1</li>', content, flags=re.MULTILINE)

    # Spoilers
    content = re.sub(r'\[spoiler\](.*?)\[\/spoiler\]', r'<span class="spoiler">\1</span>', content, flags=re.DOTALL)

    # Adjust paths in the HTML content based on the depth
    html_content = html_content.replace('src="', f'src="{"../" * depth}')
    html_content = html_content.replace('href="', f'href="{"../" * depth}')

    # Add all content to the template file and write it to the output
    html_content = html_content.replace("ALL_CONTENT_GOES_HERE", content)
    with open(output_file, 'w') as f:
        f.write(html_content)


def process_modified_index_files(root_dir, filename=None):
    modified_index_files = [filename] if filename else [path.join(dirpath, 'index.txt') for dirpath, _, filenames in walk(root_dir) if 'index.txt' in filenames]
    
    for index_file in modified_index_files:
        # Input file is the .txt, output file is the .html
        input_file = path.join(root_dir, index_file)
        output_file = path.join(root_dir, index_file[:-4] + ".html")

        # Depth is the number of folders in we are
        relative_path = path.relpath(output_file, root_dir)
        depth = relative_path.count(path.sep)
        print(f"Successfully wrote to {relative_path}")

        convert_markdown_to_html(input_file, output_file, depth)

# Runs this on our root directory
if __name__ == "__main__":
    root_directory = "."

    if len(argv) > 1:
        process_modified_index_files(root_directory, argv[1])
    else:
        process_modified_index_files(root_directory)