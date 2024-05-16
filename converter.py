import re

def convert_markdown_to_html(input_file, output_file):
    with open(input_file, 'r') as f:
        content = f.read()
    
    # Replace line breaks with paragraph tags
    content = content.replace('\n\n', '</p><p>')
    content = f'<p>{content}</p>'

    # Convert markdown headers to HTML headers
    for i in range(6, 0, -1):
        content = re.sub(r'^{} (.+)$'.format('#' * i), r'<h{}>\1</h{}>'.format(i, i), content, flags=re.MULTILINE)

    # Custom markdown to HTML conversions
    content = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', content)
    content = re.sub(r'\*(.*?)\*', r'<em>\1</em>', content)
    content = re.sub(r'__(.*?)__', r'<u>\1</u>', content)
    content = re.sub(r'\[url\]\((.*?)\)', r'<a href="\1">\1</a>', content)
    content = re.sub(r'\[hover\]\(!(.+?)\)', r'<span class="tooltip">\1<span class="tooltiptext">\1</span></span>', content)

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
