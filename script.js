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
