import re

# Function which writes the contents of a custom-syntax file to HTML
def convert_markdown_to_html(input_file, output_file):
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
        content = re.sub(('#' * i ) + r' (.+)$', r'<h{}>\1</h{}>'.format(i, i), content, flags=re.MULTILINE)

    # Custom markdown to HTML conversions
    content = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', content)
    content = re.sub(r'\*(.*?)\*', r'<em>\1</em>', content)
    content = re.sub(r'__(.*?)__', r'<u>\1</u>', content)
    content = re.sub(r'\[(.*)\]\(!(.+?)\)', r'<span class="tooltip">\1<span class="tooltiptext">\2</span></span>', content)
    content = re.sub(r'\[(.*)\]\((.*?)\)', r'<a href="\2">\1</a>', content)

    # Replace color tags
    for color, hex_value in color_dict.items():
        content = re.sub(r'<&{}>(.*?)</&{}>'.format(color, color), r'<span style="color:{};">\1</span>'.format(hex_value), content)

    # Replace info box syntax
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

    content = re.sub(r'```(\w+)\n(.*?)```', code_block_replacer, content, flags=re.DOTALL)

    # Inline code
    content = re.sub(r'`([^`]+)`', r'<code class="inline-code">\1</code>', content)

    # Lists
    content = re.sub(r'^- (.+)$', r'<li>\1</li>', content, flags=re.MULTILINE)

    # Spoiler
    content = re.sub(r'\[spoiler\](.*?)\[\/spoiler\]', r'<span class="spoiler">\1</span>', content, flags=re.DOTALL)

    html_content = html_content.replace("ALL_CONTENT_GOES_HERE", content)

    with open(output_file, 'w') as f:
        f.write(html_content)

# Example usage
convert_markdown_to_html('example.txt', 'index.html')
