// Copies code to the clipboard
function copyToClipboard(button) {
    var codeBlock = button.nextElementSibling;
    var range = document.createRange();
    range.selectNode(codeBlock);
    range.setEnd(codeBlock.lastChild, codeBlock.lastChild.textContent.length - 1);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    document.execCommand('copy');
    window.getSelection().removeAllRanges();
    button.textContent = 'Copied!';
    setTimeout(() => {
        button.textContent = 'Copy';
    }, 2000);
}

// Function to do startup things
function on_window_load() {

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
}

// Run the on_window_load function on page load
window.onload = on_window_load;
