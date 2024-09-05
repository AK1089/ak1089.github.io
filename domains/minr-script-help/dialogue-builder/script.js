// the "add a new module" selector and the div to hold components
const moduleSelector = document.getElementById('module-selector');
const scriptContent = document.getElementById('script-content');

// when the module selector is modified, create the appropriate module
moduleSelector.addEventListener('change', function () {

    // get the value of the selector and create the appropriate module
    switch (this.value.toLowerCase()) {
        case 'dialogue':
            createDialogueModule();
            break;
        default:
            break;
    }

    // reset the selector
    this.value = '';
});

function createDialogueModule() {

    // create a container for the editor
    const editorContainer = document.createElement('div');
    editorContainer.className = 'editor-container';

    // create a div for the options toolbar
    const toolbar = document.createElement('div');
    toolbar.className = 'options';

    // add a title
    const title = document.createElement('span');
    title.className = 'editor-title';
    title.textContent = 'Dialogue';
    toolbar.appendChild(title);

    // create formatting options container
    const formattingOptions = document.createElement('div');
    formattingOptions.className = 'formatting-options';

    // all buttons: four formatting toggles, the colour menu, and undo/redo
    const buttons = [
        { id: 'bold', icon: 'fa-bold' },
        { id: 'italic', icon: 'fa-italic' },
        { id: 'underline', icon: 'fa-underline' },
        { id: 'strikethrough', icon: 'fa-strikethrough' },
        { id: 'insertColor', icon: 'fa-palette' },
        { id: 'undo', icon: 'fa-rotate-left' },
        { id: 'redo', icon: 'fa-rotate-right' }
    ];

    // create a button object for each option with the given ID
    buttons.forEach(button => {
        const btn = document.createElement('button');
        btn.id = button.id;
        btn.className = 'option-button';

        // add the format class to the four formatting buttons
        if (['bold', 'italic', 'underline', 'strikethrough'].includes(button.id)) {
            btn.classList.add('format');
        }

        // add the FontAwesome icon to the button
        btn.innerHTML = `<i class="fa-solid ${button.icon}"></i>`;
        formattingOptions.appendChild(btn);
    });

    toolbar.appendChild(formattingOptions);

    // create the editor options container
    const editorOptions = document.createElement('div');
    editorOptions.className = 'editor-options';

    // all buttons for editor options: duplicate, delete, move up / down
    const editorButtons = [
        { id: 'duplicate', icon: 'fa-copy', title: 'Duplicate' },
        { id: 'delete', icon: 'fa-trash', title: 'Delete' },
        { id: 'moveUp', icon: 'fa-arrow-up', title: 'Move Up' },
        { id: 'moveDown', icon: 'fa-arrow-down', title: 'Move Down' }
    ];

    // create a button object for each option with the given ID
    editorButtons.forEach(button => {
        const btn = document.createElement('button');
        btn.id = button.id;
        btn.className = 'option-button';
        btn.title = button.title;
        btn.innerHTML = `<i class="fa-solid ${button.icon}"></i>`;
        editorOptions.appendChild(btn);
    });

    // add the editor options to the toolbar and the toolbar to the container
    toolbar.appendChild(editorOptions);
    editorContainer.appendChild(toolbar);

    // create a text editor element
    const textInput = document.createElement('div');
    textInput.id = 'text-input';
    textInput.className = 'text-input';
    textInput.contentEditable = true;

    // handle keyboard shortcuts for formatting
    textInput.addEventListener('keydown', handleKeyboardShortcuts);
    textInput.addEventListener('mouseup', updateFormatButtons);
    textInput.addEventListener('keyup', updateFormatButtons);

    // add the toolbar and editor to the container and add the container to the script content
    editorContainer.appendChild(toolbar);
    editorContainer.appendChild(textInput);
    scriptContent.appendChild(editorContainer);

    updateFormatButtons(editorContainer);
    attachEditorEventListeners(editorContainer);
}

// toggle the format of the selected text and return focus to the editor
function toggleFormat(format, editorContainer) {
    document.execCommand(format, false, null);
    updateFormatButtons(editorContainer);

    // find the text input area within the editor container and focus on it
    const textInput = editorContainer.querySelector('.text-input');
    if (textInput) {
        textInput.focus();

        // restore the selection if it was lost
        const selection = window.getSelection();
        if (selection.rangeCount === 0) {
            const range = document.createRange();
            range.selectNodeContents(textInput);
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }
}

// set the buttons of the relevant text editor to the correct active state
function updateFormatButtons(editorContainer) {
    // If editorContainer is not provided or is not an element, try to find it
    if (!editorContainer || !(editorContainer instanceof Element)) {
        editorContainer = document.activeElement.closest('.editor-container');
    }

    // If we still don't have a valid editorContainer, exit the function
    if (!editorContainer || !(editorContainer instanceof Element)) {
        console.warn('No valid editor container found');
        return;
    }

    // get the format buttons in the toolbar of the editor container
    const formatButtons = editorContainer.querySelectorAll(".format");

    // for each format button, toggle the active state based on the current
    formatButtons.forEach((button) => {
        const format = button.id;
        const isActive = document.queryCommandState(format);
        button.classList.toggle('active', isActive);
    });
}

// enable keyboard shortcuts for formatting
function handleKeyboardShortcuts(event) {
    if (event.ctrlKey || event.metaKey) {
        switch (event.key.toLowerCase()) {
            case 'b':
                event.preventDefault();
                toggleFormat('bold', event.target.closest('.editor-container'));
                break;
            case 'i':
                event.preventDefault();
                toggleFormat('italic', event.target.closest('.editor-container'));
                break;
            case 'u':
                event.preventDefault();
                toggleFormat('underline', event.target.closest('.editor-container'));
                break;
            case 'd':
                event.preventDefault();
                duplicateEditor(event.target.closest('.editor-container'));
                break;
            case 'backspace':
                event.preventDefault();
                deleteEditor(event.target.closest('.editor-container'));
                break;
            case 'arrowup':
                event.preventDefault();
                moveEditorUp(event.target.closest('.editor-container'));
                break;
            case 'arrowdown':
                event.preventDefault();
                moveEditorDown(event.target.closest('.editor-container'));
                break;
        }
    }
}

function duplicateEditor(editorContainer) {
    const newEditor = editorContainer.cloneNode(true);
    editorContainer.parentNode.insertBefore(newEditor, editorContainer.nextSibling);
    attachEditorEventListeners(newEditor);
}

function deleteEditor(editorContainer) {
    editorContainer.remove();
}

function moveEditorUp(editorContainer) {
    const previousSibling = editorContainer.previousElementSibling;
    if (previousSibling && previousSibling.classList.contains('editor-container')) {
        editorContainer.parentNode.insertBefore(editorContainer, previousSibling);
    }
}

function moveEditorDown(editorContainer) {
    const nextSibling = editorContainer.nextElementSibling;
    if (nextSibling && nextSibling.classList.contains('editor-container')) {
        editorContainer.parentNode.insertBefore(nextSibling, editorContainer);
    }
}

function attachEditorEventListeners(editorContainer) {

    // handle keyboard shortcuts for formatting
    const textInput = editorContainer.querySelector('#text-input');
    textInput.addEventListener('keydown', handleKeyboardShortcuts);
    textInput.addEventListener('mouseup', updateFormatButtons);
    textInput.addEventListener('keyup', updateFormatButtons);

    // add event listeners for formatting buttons
    const formatButtons = editorContainer.querySelectorAll(".format");
    formatButtons.forEach((button) => {
        button.addEventListener("click", () => {
            toggleFormat(button.id, editorContainer);
        });
    });

    // add event listeners for new editor option buttons
    const duplicateButton = editorContainer.querySelector('#duplicate');
    const deleteButton = editorContainer.querySelector('#delete');
    const moveUpButton = editorContainer.querySelector('#moveUp');
    const moveDownButton = editorContainer.querySelector('#moveDown');

    duplicateButton.addEventListener('click', () => duplicateEditor(editorContainer));
    deleteButton.addEventListener('click', () => deleteEditor(editorContainer));
    moveUpButton.addEventListener('click', () => moveEditorUp(editorContainer));
    moveDownButton.addEventListener('click', () => moveEditorDown(editorContainer));
}
