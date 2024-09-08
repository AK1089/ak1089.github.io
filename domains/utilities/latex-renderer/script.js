const input = document.getElementById('latex-input');
const output = document.getElementById('output');

function renderLatex() {
    const latex = input.value;
    try {
        katex.render(latex, output, {
            throwOnError: false,
            displayMode: true
        });
    } catch (error) {
        output.textContent = 'Error: ' + error.message;
    }
}

input.addEventListener('input', renderLatex);

// Initial render
renderLatex();