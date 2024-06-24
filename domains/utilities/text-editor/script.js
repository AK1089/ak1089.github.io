function updateStats() {
    const text = editor.value;
    const charCount = text.length;
    const wordCount = text.trim().split(/\s+/).filter(word => word.length > 0).length;
    const lineCount = text.split('\n').length;
    statsDiv.textContent = `Characters: ${charCount} | Words: ${wordCount} | Lines: ${lineCount}`;
}

function updateTextareaContent(newContent) {
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    editor.value = newContent;
    editor.setSelectionRange(start, end);
    editor.focus();

    // Trigger an input event to update stats
    editor.dispatchEvent(new Event('input', { bubbles: true }));
}

function updateReplaceButtonText() {
    const findText = findInput.value;
    const useRegex = useRegexCheckbox.checked;
    let occurrences = 0;

    if (findText) {
        if (useRegex) {
            try {
                const regex = new RegExp(findText, 'g');
                occurrences = (editor.value.match(regex) || []).length;
            } catch (error) {
                occurrences = 0; // Invalid regex
            }
        } else {
            occurrences = editor.value.split(findText).length - 1;
        }
    }

    replaceButton.textContent = `Replace (${occurrences})`;
}

function copyText() {
    navigator.clipboard.writeText(editor.value);
    const button = document.getElementById('copy-button')
    button.textContent = 'Copied!';
    setTimeout(() => {
        button.textContent = 'Copy';
    }, 2000);
}

function findAndReplace() {
    const findText = document.getElementById('find-text').value;
    const replaceText = document.getElementById('replace-text').value;
    const useRegex = document.getElementById('use-regex').checked;

    if (useRegex) {
        try {
            const regex = new RegExp(findText, 'g');
            updateTextareaContent(editor.value.replace(regex, replaceText));
        } catch (error) {
            alert('Invalid regular expression');
        }
    } else {
        updateTextareaContent(editor.value.split(findText).join(replaceText));
    }
}

function sortLines() {
    updateTextareaContent(editor.value.split('\n').sort().join('\n'));
}

function randomizeLines() {
    updateTextareaContent(editor.value.split('\n').sort(() => Math.random() - 0.5).join('\n'));
}

let editor;
let statsDiv;
let findInput;
let replaceButton;
let useRegexCheckbox;

// Initialize stats on page load
function local_on_body_load() {
    editor = document.getElementById('plain-text-editor');
    statsDiv = document.getElementById('stats');
    findInput = document.getElementById('find-text');
    replaceButton = document.getElementById('replace-button');
    useRegexCheckbox = document.getElementById('use-regex');

    editor.addEventListener('input', updateStats);
    findInput.addEventListener('input', updateReplaceButtonText);
    useRegexCheckbox.addEventListener('change', updateReplaceButtonText);
    editor.addEventListener('input', updateReplaceButtonText);

    updateStats();
}