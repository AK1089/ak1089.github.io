// store the colors
const BASE_COLORS = ["#AA0000", "#FF5555", "#FFAA00", "#FFFF55", "#00AA00", "#55FF55", "#55FFFF", "#00AAAA", "#0000AA", "#5555FF", "#FF55FF", "#AA00AA", "#FFFFFF", "#AAAAAA", "#555555", "#000000"];
const CUSTOM_COLORS_KEY = 'customColors';

// the "add a new module" selector and the div to hold components
const moduleSelector = document.getElementById('module-selector');
const scriptContent = document.getElementById('script-content');

// when the module selector is modified, create the appropriate module
moduleSelector.addEventListener('change', function () {

    // get the value of the selector and create the appropriate module
    switch (this.value.toLowerCase()) {
        case 'dialogue':
            scriptContent.appendChild(createModule('Dialogue'));
            break;
        case 'conditional':
            scriptContent.appendChild(createModule('Start of Conditional'));
            scriptContent.appendChild(createModule('Default Branch'));
            scriptContent.appendChild(createModule('End of Conditional'));
            break;
        default:
            break;
    }

    // reset the selector and apply conditional indentation
    this.value = '';
    applyConditionalIndentation()
});

// create a module of the given type
function createModule(moduleType) {

    // create a container for the module
    const editorContainer = document.createElement('div');
    editorContainer.className = 'editor-container';

    // create a div for the options toolbar
    const toolbar = document.createElement('div');
    toolbar.className = 'options';

    // add a title
    const title = document.createElement('span');
    title.className = 'editor-title';
    toolbar.appendChild(title);

    // set the title and module type to the provided module type
    title.textContent = moduleType;
    editorContainer.dataset.moduleType = moduleType;

    // create containers for formatting (module-specific) and editor (global) buttons
    const moduleSpecificOptions = document.createElement('div');
    const editorOptions = document.createElement('div');
    moduleSpecificOptions.className = 'formatting-options';
    editorOptions.className = 'editor-options';

    // all formatting (module-specific) buttons and the modules they are available for
    const buttons = [
        { id: 'bold', icon: 'fa-bold', availableFor: 'Dialogue', mode: 'toggle' },
        { id: 'italic', icon: 'fa-italic', availableFor: 'Dialogue', mode: 'toggle' },
        { id: 'underline', icon: 'fa-underline', availableFor: 'Dialogue', mode: 'toggle' },
        { id: 'strikethrough', icon: 'fa-strikethrough', availableFor: 'Dialogue', mode: 'toggle' },
        { id: 'insertColor', icon: 'fa-palette', availableFor: 'Dialogue', mode: 'toggle' },

        { id: 'collapseConditional', icon: 'fa-circle-chevron-down', availableFor: 'Start of Conditional', mode: 'none' },
        { id: 'addCondition', icon: 'fa-plus', availableFor: 'Start of Conditional, Extra Conditional Branch', mode: 'none' },

        { id: 'undo', icon: 'fa-rotate-left', availableFor: 'Dialogue, Start of Conditional, Extra Conditional Branch', mode: 'none' },
        { id: 'redo', icon: 'fa-rotate-right', availableFor: 'Dialogue, Start of Conditional, Extra Conditional Branch', mode: 'none' },

        { id: 'moveUp', icon: 'fa-arrow-up', title: 'Move Up', availableFor: 'all', mode: 'editor' },
        { id: 'moveDown', icon: 'fa-arrow-down', title: 'Move Down', availableFor: 'all', mode: 'editor' },
        { id: 'duplicate', icon: 'fa-copy', title: 'Duplicate', availableFor: 'all', mode: 'editor' },
        { id: 'delete', icon: 'fa-trash', title: 'Delete', availableFor: 'all', mode: 'editor' },
    ];

    // create a button object for each option with the given ID
    buttons.forEach(button => {

        // create a button element with the given ID and FontAwesome icon
        const btn = document.createElement('button');
        btn.id = button.id;
        btn.className = 'option-button';
        btn.innerHTML = `<i class="fa-solid ${button.icon}"></i>`;

        // add the format class to the buttons which are toggles
        if (button.mode.includes('toggle')) {
            btn.classList.add('format');
        }

        // add the button to the formatting options if it is available for the current module type
        if (button.availableFor.split(', ').includes(moduleType) || button.availableFor === 'all') {
            if (button.mode.includes('editor')) {
                editorOptions.appendChild(btn);
            } else {
                moduleSpecificOptions.appendChild(btn);
            }
        };
    });

    // add these button groups to the toolbar and add the toolbar to the editor container
    toolbar.appendChild(moduleSpecificOptions);
    toolbar.appendChild(editorOptions);
    editorContainer.appendChild(toolbar);

    // create a text editor element in either rich or basic text mode depending on the module type
    if (moduleType == 'Dialogue') {
        const textInput = document.createElement('div');
        textInput.id = 'text-input';
        textInput.className = 'text-input';
        textInput.contentEditable = true;
        editorContainer.appendChild(textInput);
    } else if (moduleType == 'Extra Conditional Branch' || moduleType == 'Start of Conditional') {
        const textInput = document.createElement('div');
        textInput.id = 'text-input-basic';
        textInput.className = 'text-input-basic';
        textInput.contentEditable = true;
        editorContainer.appendChild(textInput);
    } else {
        // round the bottom corners for consistency
        toolbar.style.borderRadius = '8px';
    }

    // set up all the buttons with starter highlights and event listeners
    updateFormatButtons(editorContainer);
    attachEditorEventListeners(editorContainer);

    // return the editor container
    return editorContainer;
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

    // if editorContainer is not provided or is not an element, try to find it
    if (!editorContainer || !(editorContainer instanceof Element)) {
        editorContainer = document.activeElement.closest('.editor-container');
    }

    // if we still don't have a valid editorContainer, exit the function
    if (!editorContainer || !(editorContainer instanceof Element)) {
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

    // get the color selector and palette
    const colorSelector = editorContainer.querySelector('#insertColor');
    const colorPalette = editorContainer.querySelector('.color-palette');

    // if the color selector and palette exist, toggle the active state based on the current display state
    if (colorSelector && colorPalette) {
        colorSelector.classList.toggle('active', colorPalette.style.display === 'block');
    }
}

// enable keyboard shortcuts for formatting
function handleKeyboardShortcuts(event) {

    // if the control/command key is pressed, prevent the default action and handle the key press
    if (event.ctrlKey || event.metaKey) {
        switch (event.key.toLowerCase()) {

            // handle the key press for each shortcut: bold, italic, underline
            case 'b':
                event.preventDefault(); toggleFormat('bold', event.target.closest('.editor-container')); break;
            case 'i':
                event.preventDefault(); toggleFormat('italic', event.target.closest('.editor-container')); break;
            case 'u':
                event.preventDefault(); toggleFormat('underline', event.target.closest('.editor-container')); break;

            // duplicate the current module
            case 'd':
                event.preventDefault(); duplicateEditor(event.target.closest('.editor-container')); break;

            // open/close the color palette selector
            case 'p':

                // prevent the default action and get the color selector and palette
                event.preventDefault();
                const editorContainer = event.target.closest('.editor-container');
                const colorPalette = editorContainer.querySelector('.color-palette');
                const colorSelector = editorContainer.querySelector('#insertColor');

                // toggle the active state of the color selector and display style of the palette
                colorPalette.style.display = colorPalette.style.display === 'none' ? 'block' : 'none';
                colorSelector.classList.toggle('active', colorPalette.style.display === 'block');
                break;

            // move the current editor up or down
            case 'arrowup':
                event.preventDefault(); moveEditorUp(event.target.closest('.editor-container')); break;
            case 'arrowdown':
                event.preventDefault(); moveEditorDown(event.target.closest('.editor-container')); break;
        }
    }
}

// duplicate the current box
function duplicateEditor(editorContainer) {
    const newEditor = editorContainer.cloneNode(true);
    editorContainer.parentNode.insertBefore(newEditor, editorContainer.nextSibling);
    attachEditorEventListeners(newEditor);
    applyConditionalIndentation()
}

// delete the current box
function deleteEditor(editorContainer) {
    editorContainer.remove();
    applyConditionalIndentation()
}

// move the current box up one position
function moveEditorUp(editorContainer) {
    const previousSibling = editorContainer.previousElementSibling;
    const nextSibling = editorContainer.nextElementSibling;

    // if there is a preceding sibling that is an editor container, move the current one before it
    if (previousSibling && previousSibling.classList.contains('editor-container')) {
        if (nextSibling && nextSibling.classList.contains('editor-container')) {
            editorContainer.parentNode.insertBefore(previousSibling, nextSibling);
        } else {
            editorContainer.parentNode.appendChild(previousSibling);
        }
    }

    // if this is the start of a conditional block, uncollapse it
    if (editorContainer.dataset.moduleType === 'Start of Conditional') {
        editorContainer.dataset.collapsed = 'false';
    }

    applyConditionalIndentation()
}

// move the current box down one position
function moveEditorDown(editorContainer) {
    const nextSibling = editorContainer.nextElementSibling;

    // if there is a succeeding sibling that is an editor container, move the current one after it
    if (nextSibling && nextSibling.classList.contains('editor-container')) {
        editorContainer.parentNode.insertBefore(nextSibling, editorContainer);
    }

    // if this is the start of a conditional block or is moving into one, uncollapse it
    if (editorContainer.dataset.moduleType === 'Start of Conditional') {
        editorContainer.dataset.collapsed = 'false';
    }
    if (nextSibling.dataset.moduleType === 'Start of Conditional') {
        nextSibling.dataset.collapsed = 'false';
    }

    applyConditionalIndentation()
}

// add event listeners to each button in an editor container
function attachEditorEventListeners(editorContainer) {

    // handle keyboard shortcuts for formatting
    const textInput = editorContainer.querySelector('#text-input');

    if (textInput) {
        textInput.addEventListener('keydown', handleKeyboardShortcuts);
        textInput.addEventListener('mouseup', updateFormatButtons);
        textInput.addEventListener('keyup', updateFormatButtons);
    }

    // add event listeners for formatting buttons
    const formatButtons = editorContainer.querySelectorAll(".format");
    formatButtons.forEach((button) => {
        if (button.id != 'insertColor') {
            button.addEventListener("mousedown", (e) => {
                e.preventDefault();
                toggleFormat(button.id, editorContainer);
            });
        }
    });

    // get the undo and redo buttons and add event listeners to them
    const undoButton = editorContainer.querySelector('#undo');
    const redoButton = editorContainer.querySelector('#redo');

    if (undoButton && redoButton) {
        undoButton.addEventListener("click", () => document.execCommand('undo', false, null));
        redoButton.addEventListener("click", () => document.execCommand('redo', false, null));
    }

    // get the editor option buttons
    const duplicateButton = editorContainer.querySelector('#duplicate');
    const deleteButton = editorContainer.querySelector('#delete');
    const moveUpButton = editorContainer.querySelector('#moveUp');
    const moveDownButton = editorContainer.querySelector('#moveDown');

    // add event listeners to them
    duplicateButton.addEventListener('click', () => duplicateEditor(editorContainer));
    deleteButton.addEventListener('click', () => deleteEditor(editorContainer));
    moveUpButton.addEventListener('click', () => moveEditorUp(editorContainer));
    moveDownButton.addEventListener('click', () => moveEditorDown(editorContainer));

    // get the color palette open button
    const colorSelector = editorContainer.querySelector('#insertColor');

    // if the color selector exists, create and display the color palette
    if (colorSelector) {
        const colorPalette = createColorPalette(editorContainer);
        editorContainer.appendChild(colorPalette);

        // add a listener to open the color palette when the button is clicked
        colorSelector.addEventListener('mousedown', (e) => {
            e.preventDefault();
            colorSelector.classList.toggle('active', colorPalette.style.display === 'none');
            colorPalette.style.display = colorPalette.style.display === 'none' ? 'block' : 'none';
        });
    }

    // get the buttons which exist only for conditional modules
    const addConditionButton = editorContainer.querySelector('#addCondition');
    const collapseConditionalButton = editorContainer.querySelector('#collapseConditional');

    // if they exist, add event listeners to them
    if (addConditionButton) {
        addConditionButton.addEventListener('click', () => {
            const newBranch = (createModule('Extra Conditional Branch'));
            editorContainer.parentNode.insertBefore(newBranch, editorContainer.nextSibling);
        });
    }

    if (collapseConditionalButton) {
        collapseConditionalButton.addEventListener('click', () => {
            editorContainer.dataset.collapsed = editorContainer.dataset.collapsed === 'true' ? 'false' : 'true';
            applyConditionalIndentation();
        });
    }

}

// create and manage the color palette
function createColorPalette(editorContainer) {

    // remove any existing color palettes
    const colorPalettes = editorContainer.getElementsByClassName('color-palette');
    while (colorPalettes.length > 0) {
        colorPalettes[0].remove();
    }

    // create the color palette container and make it invisible
    const colorPalette = document.createElement('div');
    colorPalette.className = 'color-palette';
    colorPalette.style.display = 'none';
    colorPalette.style.padding = '10px';

    // create titles for each of the two rows of colors
    const baseColorTitle = document.createElement('div');
    baseColorTitle.textContent = 'Default Minecraft colors';
    const customColorTitle = document.createElement('div');
    customColorTitle.textContent = 'Custom colors';

    // create the row of default color squares
    const baseColorRow = document.createElement('div');
    baseColorRow.className = 'color-row';
    BASE_COLORS.forEach(color => {
        const colorSquare = createColorSquare(color, editorContainer);
        baseColorRow.appendChild(colorSquare);
    });

    // create the row for custom colors
    const customColorRow = document.createElement('div');
    customColorRow.className = 'color-row';

    // load and display custom colors
    let customColors = JSON.parse(localStorage.getItem(CUSTOM_COLORS_KEY)) || [];
    displayCustomColors(customColors, customColorRow, editorContainer);

    // add the titles and rows to the color palette separated by a line
    colorPalette.appendChild(baseColorTitle);
    colorPalette.appendChild(baseColorRow);
    colorPalette.appendChild(document.createElement('hr'));
    colorPalette.appendChild(customColorTitle);
    colorPalette.appendChild(customColorRow);

    // return the color palette
    return colorPalette;
}

// create a color square for the color palette
function createColorSquare(color, editorContainer) {

    // add a solid box with the given color
    const colorSquare = document.createElement('div');
    colorSquare.className = 'color-square';
    colorSquare.style.backgroundColor = color;

    // add an event listener to apply the color to the selected text and hide the color palette
    colorSquare.addEventListener('mousedown', (e) => {
        e.preventDefault();
        document.execCommand('foreColor', false, color);
        editorContainer.querySelector('.color-palette').style.display = 'none';
    });

    // return the color square
    return colorSquare;
}

// add a custom color to the color palette
function addCustomColor(customColorRow, editorContainer) {

    // create an input element to select a custom color
    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.style.display = 'none';
    customColorRow.appendChild(colorInput);
    colorInput.click();


    // add an event listener to apply the custom color to the selected text and save it
    colorInput.addEventListener('change', (e) => {
        const newColor = e.target.value;
        colorInput.remove();

        // save the new custom color to local storage
        let customColors = JSON.parse(localStorage.getItem(CUSTOM_COLORS_KEY)) || [];
        customColors.push(newColor);

        // limit the number of custom colors to the number of base colors minus one
        if (customColors.length > BASE_COLORS.length - 1) {
            customColors = customColors.slice(-BASE_COLORS.length + 1);
        }

        // display the updated custom colors and save them to local storage
        displayCustomColors(customColors, customColorRow, editorContainer);
        localStorage.setItem(CUSTOM_COLORS_KEY, JSON.stringify(customColors));
    });
}

// display the custom colors in the color palette
function displayCustomColors(customColors, customColorRow, editorContainer) {
    // clear existing color squares
    customColorRow.innerHTML = '';

    // first, create a button to add a custom color
    const addColorButton = document.createElement('button');
    addColorButton.innerHTML = '<i class="fas fa-plus"></i>';
    addColorButton.addEventListener('mousedown', (e) => {
        e.preventDefault();
        addCustomColor(customColorRow, editorContainer);
    });
    addColorButton.className = 'add-color';
    customColorRow.appendChild(addColorButton);

    // then, create and append color squares for each custom color
    customColors.forEach(color => {
        const colorSquare = createColorSquare(color, editorContainer);
        customColorRow.appendChild(colorSquare);
    });
}

// apply conditional indentation to each module in the script content
function applyConditionalIndentation() {

    // set the initial indentation level and collapse level
    let indentationLevel = 0;
    const modules = scriptContent.children;
    let collapseIndentationLevel = [];

    // iterate through each module and apply indentation
    for (let i = 0; i < modules.length; i++) {
        const module = modules[i];
        const moduleType = module.dataset.moduleType;

        // if we're in "collapse mode" (when collapseIndentationLevel isn't empty) hide the module
        module.style.display = (collapseIndentationLevel.length > 0) ? 'none' : 'block';

        // if the module is the start of a conditional block, set whether its children are collapsed
        if (moduleType === "Start of Conditional") {

            // if they are, then add the current indentation level to the collapse stack and set the icon
            if (module.dataset.collapsed === 'true') {
                collapseIndentationLevel.push(indentationLevel);
                module.querySelector('#collapseConditional').innerHTML = `<i class="fa-solid fa-circle-chevron-up"></i>`;
            } else {
                module.querySelector('#collapseConditional').innerHTML = `<i class="fa-solid fa-circle-chevron-down"></i>`;
            }
        }

        // if the module is the end of a conditional block, remove the last indentation level from the stack
        if (moduleType === "End of Conditional" && (collapseIndentationLevel[collapseIndentationLevel.length - 1] == (indentationLevel - 1))) {
            collapseIndentationLevel.pop();
        }

        // if the module is the end of a conditional block, dedent 1 level
        // if it's a branch, also dedent 1 level (this will be temporary)
        if (moduleType === "End of Conditional" || moduleType.includes("Branch")) {
            indentationLevel--;
        }

        // apply the actual indentation
        if (indentationLevel > 0) {
            module.classList.add('indented-module');
            module.style.marginLeft = `${indentationLevel * 30}px`;
        } else {
            module.classList.remove('indented-module');
            module.style.marginLeft = '0';
        }

        // if the module is the start of a conditional block, indent 1 level
        // if it's a branch, indent back 1 level (this fixes the temporary dedent)
        if (moduleType === "Start of Conditional" || moduleType.includes("Branch")) {
            indentationLevel++;
        }
    }
}