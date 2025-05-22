const END_MARKER = 'END_OF_PUZZLE';
const PUZZLE_KEY = 'puzzle-key';

// controls the current game state with all progress and history
const gameState = {
    puzzle: null,
    currentText: '',
    brackets: [],
    innerBrackets: [],
    solvedBrackets: 0,
    totalBrackets: 0,
    guessHistory: []
};

// DOM elements
const puzzleContainer = document.getElementById('puzzle-container');
const puzzleText = document.getElementById('puzzle-text');
const guessInput = document.getElementById('guess-input');
const statusMessage = document.getElementById('status-message');
const puzzleFileInput = document.getElementById('puzzle-file');
const bracketsRemainingEl = document.getElementById('brackets-remaining');
const solvedBracketsEl = document.getElementById('solved-brackets');
const historyContainer = document.getElementById('history');
const historyList = document.getElementById('history-list');
const gameCompleteEl = document.getElementById('game-complete');

// helper function to escape special characters in regex
function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
}

// given a bracket, resolve it to its final answer
function resolveQuestionPlaceholders(bracket) {
    let resolved = bracket.question;
    const placeholders = resolved.match(/\{\{(\d+)\}\}/g) || [];

    // for each placeholder, trace the path to the child bracket
    placeholders.forEach(ph => {
        const idx = parseInt(ph.match(/\d+/)[0], 10);
        const childPath = `${bracket.path}/${idx}`;

        // find the child bracket in the game state and replace the placeholder
        const child = gameState.brackets.find(b => b.path === childPath);
        if (child && child.solved) {
            resolved = resolved.replaceAll(ph, child.answer);
        }
    });
    return resolved;
}

// return a list of all brackets in the puzzle given a json object
function processPuzzle(data) {

    // recursive function to walk through the puzzle tree
    function walk(node, depth = 0, path = '') {
        const auto = node.answer === END_MARKER;
        const obj = { question: node.question, answer: node.answer, depth, path, solved: auto, auto, children: [] };

        // add each child to the path, incrementing the depth
        if (Array.isArray(node.brackets)) {
            node.brackets.forEach((child, i) => {
                const childPath = `${path}/${i}`;
                const childObj = walk(child, depth + 1, childPath);
                obj.children.push(childObj);
            });
        }
        return obj;
    }

    // build tree from this then flatten it
    const root = walk(data.puzzle);
    const flat = [];
    (function flatten(node) { flat.push(node); node.children.forEach(flatten); })(root);
    flat.sort((a, b) => b.depth - a.depth);
    return flat;
}

// given a puzzle object, generate the display text
function generateDisplayText(puzzleData, brackets) {

    // recursive function to render the puzzle text
    function render(node, path = '') {

        // base case: if the node is a string, return it
        if (typeof node === 'string') return node;

        // if the node is a bracket, find it in the brackets array
        const obj = brackets.find(b => b.path === path);
        if (obj && obj.solved && !obj.auto) return obj.answer;

        // if the node is a question, replace placeholders with answers
        let content = node.question;
        if (Array.isArray(node.brackets)) {
            const placeholders = content.match(/\{\{(\d+)\}\}/g) || [];
            placeholders.forEach(ph => {
                const idx = parseInt(ph.match(/\d+/)[0], 10);
                const childPath = `${path}/${idx}`;
                const rendered = render(node.brackets[idx], childPath);
                content = content.replace(ph, rendered);
            });
        }
        return path === '' ? content : `[${content}]`;
    }
    return render(puzzleData.puzzle);
}

// given a list of brackets, find the innermost ones (which can be solved by the player now)
function findInnerBrackets(brackets) {
    return brackets.filter(b => !b.auto && !b.solved && (b.children.length === 0 || b.children.every(c => c.solved)));
}

// display the puzzle text with highlighted brackets for those that can be solved now
function displayPuzzle() {
    gameState.currentText = generateDisplayText(gameState.puzzle, gameState.brackets);
    gameState.innerBrackets = findInnerBrackets(gameState.brackets);

    let html = gameState.currentText;

    // highlight innermost brackets first
    gameState.innerBrackets.forEach(b => {
        const q = resolveQuestionPlaceholders(b);
        const rx = new RegExp(`\\[(${escapeRegExp(q)})\\]`, 'g');
        html = html.replace(rx, '<span class="inner-bracket">[$1]</span>');
    });

    // highlight remaining brackets
    html = html.replace(/\[([^\[\]]+)\]/g, (m, c) => m.includes('inner-bracket') ? m : `<span class=\"bracket\">[${c}]</span>`);

    puzzleText.innerHTML = html;
    updateProgress();
}

// function to update the progress display
function updateProgress() {
    // count the number of solved brackets and those remaining
    const remaining = gameState.brackets.filter(b => !b.auto && !b.solved).length;
    bracketsRemainingEl.textContent = `Brackets: ${remaining}`;
    solvedBracketsEl.textContent = `Solved: ${gameState.solvedBrackets}`;

    // if there are no remaining brackets, show the game complete message
    if (remaining === 0) {
        gameCompleteEl.classList.remove('hidden');
        statusMessage.classList.add('hidden');
        guessInput.classList.add('hidden');
        guessInput.disabled = true;
    }
}

// function to add a guess to the history
function addToHistory(clue, answer) {
    gameState.guessHistory.push({ clue, answer });
    const item = document.createElement('div');
    item.className = 'history-item';
    item.innerHTML = `<span class="guess">"${clue}"</span><span class="result">→ "${answer}"</span>`;

    // add the item to the history list and make sure the history container is visible
    historyList.appendChild(item);
    historyContainer.classList.remove('hidden');
}

// show a status message to the user
function showStatus(msg, type) {
    statusMessage.textContent = msg;
    statusMessage.className = `status-message ${type}`;
    statusMessage.classList.remove('hidden');
}

// runs when the user guesses a bracket correctly
function handleCorrectGuess(bracket) {
    // resolve the clue into a string without placeholders and add it to the history
    const clue = resolveQuestionPlaceholders(bracket);
    addToHistory(clue, bracket.answer);

    // mark the bracket as solved and update the game state
    bracket.solved = true;
    gameState.solvedBrackets++;

    // update the display text and progress
    showStatus(`Correct! "${clue}" → "${bracket.answer}"`, 'success');
    displayPuzzle();

    // reset the input field
    guessInput.value = '';
    guessInput.focus();
}

// function to check if the user's guess matches any of the highlighted brackets
function attemptGuess(showError = false) {
    const guess = guessInput.value.trim();
    if (!guess) return;

    // check if the guess matches any of the inner brackets
    for (const b of gameState.innerBrackets) {
        // if so, the guess is correct
        if (b.answer.toLowerCase() === guess.toLowerCase()) {
            handleCorrectGuess(b);
            return;
        }
    }

    if (showError) {
        showStatus("That doesn't match the answer to any highlighted bracket.", 'error');
        guessInput.select();
    }
}

// live checking every keystroke, but also allow Enter to submit (which will show an error if the guess is wrong)
guessInput.addEventListener('input', () => attemptGuess(false));
guessInput.addEventListener('keydown', e => { if (e.key === 'Enter') attemptGuess(true); });

// function to load a puzzle from a JSON string
function loadPuzzleFromJSON(json) {
    try {
        const data = JSON.parse(json);
        if (!data.puzzle) {
            showStatus('Invalid puzzle format', 'error');
            return;
        }

        gameState.puzzle = data;
        gameState.brackets = processPuzzle(data);
        gameState.solvedBrackets = 0;
        gameState.totalBrackets = gameState.brackets.filter(b => !b.auto).length;
        gameState.guessHistory = [];

        historyList.innerHTML = '';
        historyContainer.classList.add('hidden');
        gameCompleteEl.classList.add('hidden');
        guessInput.disabled = false;
        puzzleContainer.classList.remove('hidden');
        statusMessage.classList.add('hidden');
        guessInput.classList.remove('hidden');
        gameCompleteEl.classList.add('hidden');

        guessInput.value = '';
        guessInput.focus();
        showStatus('Puzzle loaded successfully!', 'success');

        displayPuzzle();
        guessInput.focus();
    } catch (err) {
        showStatus('Error loading puzzle: ' + err.message, 'error');
    }
}

// function to obfuscate the puzzle object for storage (not used here, but kept for reference)
function obfuscatePuzzle(puzzleObject) {
    const jsonString = JSON.stringify(puzzleObject);
    const key = PUZZLE_KEY;

    // simple XOR obfuscation and base64 encoding
    const obfuscated = jsonString.split('').map((char, i) => 
        String.fromCharCode(char.charCodeAt(0) ^ key.charCodeAt(i % key.length))
    ).join('');
    return btoa(obfuscated);
}

// function to handle file input for loading a puzzle
puzzleFileInput.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
        try {
            const key = PUZZLE_KEY;
            const decoded = atob(evt.target.result);
            const deobfuscated = decoded.split('').map((char, i) => 
                String.fromCharCode(char.charCodeAt(0) ^ key.charCodeAt(i % key.length))
            ).join('');
            loadPuzzleFromJSON(deobfuscated);
        } catch (error) {
            console.error('Invalid puzzle file format');
        }
    };
    reader.readAsText(file);
});