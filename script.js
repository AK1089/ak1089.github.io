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

// Function to replace variable placeholders with their values
function replaceVariables() {

    var birthDate = new Date('2004-02-07');
    var currentDate = new Date();
    var age = currentDate.getFullYear() - birthDate.getFullYear();
    var monthDiff = currentDate.getMonth() - birthDate.getMonth();
    console.log(birthDate, currentDate);
    if (monthDiff < 0 || (monthDiff === 0 && currentDate.getDate() < birthDate.getDate())) {
        age--;
    }
    
    current_age_in_days = 'I was born on ' + birthDate.toDateString() // + ', making me ' + (Math.floor((currentDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24))).toString() + ' days old.';

    // Define your global variable dictionary
    const variables = {
        variable_content: "Hello, World!",
        current_age_in_years: age.toString(),
        current_age_in_days: current_age_in_days.toString().Date,
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
}

// Run the replaceVariables function on page load
window.onload = replaceVariables;
