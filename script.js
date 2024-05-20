function copyToClipboard(button) {
    var codeBlock = button.nextElementSibling;
    var range = document.createRange();
    range.selectNode(codeBlock);
    window.getSelection().removeAllRanges(); 
    window.getSelection().addRange(range); 
    document.execCommand('copy');
    window.getSelection().removeAllRanges();
    button.textContent = 'Copied!';
    setTimeout(() => {
        button.textContent = 'Copy';
    }, 2000);
}

// Function to do startup things like replacing variables
function on_window_load() {

    console.log("hiii fellow console enthusiast <3");

    var birthDate = new Date('2004-02-07');
    var currentDate = new Date();
    var age = currentDate.getFullYear() - birthDate.getFullYear();
    var monthDiff = currentDate.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && currentDate.getDate() < birthDate.getDate())) {
        age--;
    }
    
    current_age_in_days = 'I was born on ' + birthDate.toDateString() + ', making me ' + (Math.floor((currentDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24))).toString() + ' days old.';

    // Define your global variable dictionary
    const variables = {
        variable_content: "Hello, World!",
        current_age_in_years: age.toString(),
        current_age_in_days: current_age_in_days.toString(),
        current_date: currentDate.toLocaleTimeString()
    };
    
    // Get the entire HTML content
    let html = document.body.innerHTML;

    // Loop through the dictionary and replace each placeholder
    for (const [key, value] of Object.entries(variables)) {
        const variableRegex = new RegExp(`\\$\\{${key}\\}`, 'g');
        html = html.replace(variableRegex, value);
    }
    
    // Update the HTML content
    document.body.innerHTML = html;

    // Render LaTeX
    renderMathInElement(document.body, {
        delimiters: [
            {left: "\\(", right: "\\)", display: false},
            {left: "\\[", right: "\\]", display: true}
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
            // Set the target attribute to "_blank" to open the link in a new tab
            link.setAttribute('target', '_blank');
        }
    }
}

// Run the on_window_load function on page load
window.onload = on_window_load;
