import re

def convert_markdown_to_html(input_file, output_file):
    with open(input_file, 'r') as f:
        content = f.read()
    
    # Custom markdown to HTML conversions
    content = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', content)
    content = re.sub(r'\*(.*?)\*', r'<em>\1</em>', content)
    content = re.sub(r'__(.*?)__', r'<u>\1</u>', content)
    content = re.sub(r'\[url\]\((.*?)\)', r'<a href="\1">\1</a>', content)
    content = re.sub(r'\[hover\]\(!(.+?)\)', r'<span title="\1" style="border-bottom: 1px dotted; cursor: help;">\1</span>', content)

    # Code blocks
    def code_block_replacer(match):
        language = match.group(1)
        code = match.group(2)
        code_lines = code.split('\n')
        formatted_code = ''.join(f'<span>{line}</span>\n' for line in code_lines)
        return f'<pre><code data-language="{language}" class="line-numbers">{formatted_code}</code></pre>'

    content = re.sub(r'```(\w+)\n(.*?)```', code_block_replacer, content, flags=re.DOTALL)

    # Spoiler
    content = re.sub(r'\[spoiler\](.*?)\[\/spoiler\]', r'<span class="spoiler">\1</span>', content, flags=re.DOTALL)

    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AK1089's Website</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
{content}
</body>
</html>"""

    with open(output_file, 'w') as f:
        f.write(html_content)

# Example usage
convert_markdown_to_html('example.txt', 'index.html')
