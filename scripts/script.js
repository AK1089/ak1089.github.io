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

function setVisitedPage(page) {
    let visitedPages = JSON.parse(localStorage.getItem('visitedPages')) || [];

    fetch('/map/siteMap.json')
        .then(response => response.json())
        .then(siteMap => {
            let pageTitle = siteMap.find(p => p.url === page)?.name || 'Page';
            document.title = `${pageTitle} | AK1089's Website`;
        })
        .catch(error => {
            console.error('Error fetching site map:', error);
        });

    if (getCookie("cookiePermissions") === "cookiesDisabled") {
        return;
    }

    if (!visitedPages.includes(page)) {
        visitedPages.push(page);
        localStorage.setItem('visitedPages', JSON.stringify(visitedPages));
    }
}

function getVisitedPages() {
    return JSON.parse(localStorage.getItem('visitedPages')) || [];
}


function getHostname () {
    const localRedirectUri = 'http://localhost:8000/';
    const productionRedirectUri = 'https://ak1089.github.io/';

    // Determine the current environment and set the appropriate redirect URI
    const isLocalhost = (window.location.hostname === 'localhost');
    return isLocalhost ? localRedirectUri : productionRedirectUri;
}

// Function to set a cookie
function setCookie(name, value, days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

// Function to get a cookie value
function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
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

    setVisitedPage(window.location.pathname);

}
