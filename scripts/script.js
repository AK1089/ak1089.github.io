// Copies code from a code block to the clipboard
function copyToClipboard(button) {
    var codeBlock = button.nextElementSibling;
    var code = codeBlock.textContent;
    
    // Remove leading and trailing newline characters
    code = code.replace(/^\n|\n$/g, '');
    code = code.replace(/>>> /g, '');
    
    navigator.clipboard.writeText(code);
    
    // Animates the button
    button.textContent = 'Copied!';
    setTimeout(() => {
        button.textContent = 'Copy';
    }, 2000);
}

// Function to do startup things
function on_body_load() {

    // I love my curious little developer buddies
    console.log("hiii fellow console enthusiast <3");

    // If the script in the directory has defined a fill_out_variables method then use it
    try {
        const variables = fill_out_variables()

        // Get the entire HTML content
        let html = document.body.innerHTML;

        // Loop through the dictionary and replace each placeholder
        for (const [key, value] of Object.entries(variables)) {
            const variableRegex = new RegExp(`\\$\\{${key}\\}`, 'g');
            html = html.replace(variableRegex, value);
        }

        // Update the HTML content
        document.body.innerHTML = html;
    } catch { }

    // Render LaTeX
    renderMathInElement(document.body, {
        delimiters: [
            { left: "\\(", right: "\\)", display: false },
            { left: "\\[", right: "\\]", display: true }
        ]
    });

    // Get all the links in the document
    const links = document.getElementsByTagName('a');

    // Iterate through each link
    for (let i = 0; i < links.length; i++) {
        const link = links[i];
        const href = link.getAttribute('href');

        // Check if the link is an external link (contains "http" or "www")
        if (href && (href.includes('http') || href.includes('www'))) {

            // Set the target attribute to "_blank" to open the link in a new tab and possibly add a º to indicate external link
            link.setAttribute('target', '_blank');
            if (link.getAttribute("class") != "social-link") {
                link.innerHTML += 'º';
            }
        }
    }

    // If the script in the directory has defined a local_on_body_load method then use it
    try {
        local_on_body_load()
    } catch { }

}
