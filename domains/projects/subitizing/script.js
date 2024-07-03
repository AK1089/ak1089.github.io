// Parameters for the game
let session = {
    minDots: 1,
    maxDots: 5,
    trialCount: 3,
    trials: [],
    currentTrialIndex: 0
};

// Some helper variables
let currentDots = 0;
let startTime = 0;

// Game elements
const dotContainer = document.getElementById('dot-container');
const message = document.getElementById('message');
const startButton = document.getElementById('start-button');
const statsButton = document.getElementById('stats-button');
const exportButton = document.getElementById('export-button');

// Progress bar and input elements
const progressBar = document.getElementById('progress-bar');
const minDotsInput = document.getElementById('min-dots');
const maxDotsInput = document.getElementById('max-dots');
const trialCountInput = document.getElementById('trial-count');

// Event listeners
startButton.addEventListener('click', startSession);
statsButton.addEventListener('click', showStats);
exportButton.addEventListener('click', exportStatistics);
document.addEventListener('keydown', handleKeyPress);

// Initialise the game
function startSession() {

    // Reset the game state and set parameters
    session.minDots = parseInt(minDotsInput.value);
    session.maxDots = parseInt(maxDotsInput.value);
    session.trialCount = parseInt(trialCountInput.value);
    session.trials = generateTrials();
    session.currentTrialIndex = 0;

    // Disable inputs and buttons
    startButton.disabled = true;
    statsButton.disabled = true;
    minDotsInput.readOnly = true;
    maxDotsInput.readOnly = true;
    trialCountInput.readOnly = true;

    // Start the game
    updateProgress();
    startCountdown(5);
}

// Fill the progress bar 
function updateProgress() {
    const totalTrials = session.trials.length;
    const completedTrials = session.currentTrialIndex;
    const percentage = (completedTrials / totalTrials) * 100;
    progressBar.style.width = `${percentage}%`;
}

// Generate the trials for the session by shuffling the dot counts
function generateTrials() {
    let trials = [];

    // Add each number of dots from min to max for the specified number of trials
    for (let i = session.minDots; i <= session.maxDots; i++) {
        for (let j = 0; j < session.trialCount; j++) {
            trials.push(i);
        }
    }
    return shuffleArray(trials);
}

// Shuffle an array by swapping elements at random indices
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Countdown before starting a trial
function startCountdown(count = 3) {
    if (count > 0) {
        message.textContent = count;
        setTimeout(() => startCountdown(count - 1), 700);
    } else {
        startTrial();
    }
}

// Start a trial by showing the dots
function startTrial() {

    // Check if the session is complete and end it if so
    if (session.currentTrialIndex >= session.trials.length) {
        endSession();
        return;
    }

    // Show the dots and start the timer
    currentDots = session.trials[session.currentTrialIndex];
    clearDots();
    drawDots(currentDots);
    startTime = Date.now();
}

// Generate a random colour that is not too bright
function getRandomColor() {
    let color = "#";

    // Generate a random hex colour
    for (let i = 0; i < 6; i++) {
        const randomValue = Math.floor(Math.random() * 16);
        color += randomValue.toString(16);
    }

    // Check the brightness of the colour
    const hex = parseInt(color.substring(1), 16);
    const r = (hex >> 16) & 255;
    const g = (hex >> 8) & 255;
    const b = hex & 255;
    const brightness = 0.2126 * r + 0.7152 * g + 0.0722 * b;

    // If the colour is too bright, generate a new one
    if (brightness > 200) {
        return getRandomColor();
    }
    return color;
}

// Draw the specified number of dots at random positions
function drawDots(count) {
    for (let i = 0; i < count; i++) {
        const dot = document.createElement('div');
        dot.className = 'dot';

        // Randomise the position, size, and colour of the dot
        dot.style.left = `${Math.random() * 560}px`;
        dot.style.top = `${Math.random() * 360}px`;
        dot.style.backgroundColor = getRandomColor();

        // Uncomment to randomise the shape of the dot (either circle or square)
        // dot.style.borderRadius = `${50 * Math.floor(2 * Math.random())}%`;

        dotContainer.appendChild(dot);
    }
}

// Clear the dots from the screen
function clearDots() {
    while (dotContainer.firstChild) {
        dotContainer.removeChild(dotContainer.firstChild);
    }
}

// Handle key presses during the game
function handleKeyPress(event) {

    // Check if the game is in progress
    if (startTime === 0) return;

    // Check if the key pressed is a number
    const key = event.key;
    if (key >= '0' && key <= '9') {

        // Record the reaction time and the guessed number
        const pressedDigit = key === '0' ? 10 : parseInt(key);
        const reactionTime = Date.now() - startTime;

        // Infer the actual guessed number
        let guessedNumber = 10 * Math.round((currentDots - pressedDigit) / 10) + pressedDigit;
        const isCorrect = guessedNumber === currentDots;

        // Ensure the guessed number is within the min and max range
        if (guessedNumber < 10 * Math.floor(session.minDots / 10)) { guessedNumber += 10; }
        if (guessedNumber > 10 * Math.ceil(session.maxDots / 10)) { guessedNumber -= 10; }

        // Record the trial data
        session.trials[session.currentTrialIndex] = {
            actual: currentDots,
            guessed: guessedNumber,
            time: reactionTime,
            timestamp: Date.now(),
            isCorrect: isCorrect
        };

        // Show the result and move to the next trial
        clearDots();
        message.textContent = `You guessed ${guessedNumber}. The actual count was ${currentDots}.`;
        startTime = 0;
        session.currentTrialIndex++;
        updateProgress();
        setTimeout(startCountdown, 1700);
    }
}

// End the session
function endSession() {
    message.textContent = "Session complete! Check your stats.";
    updateProgress();

    // Enable the inputs and buttons again
    minDotsInput.readOnly = true;
    maxDotsInput.readOnly = true;
    trialCountInput.readOnly = true;
    startButton.disabled = false;
    statsButton.disabled = false;
}

// Show the statistics overview for the session
function showStats() {
    if (session.trials.length === 0 || typeof session.trials[0] !== 'object') {
        alert("No data available. Play the game first!");
        return;
    }

    // Create dictionaries to store details
    const accuracyByNumber = {};
    const timesByNumber = {};

    // For each trial, record the accuracy and time taken
    session.trials.forEach(trial => {

        // Set up counts for total of each, creating if unnecessary
        if (!accuracyByNumber[trial.actual]) {
            accuracyByNumber[trial.actual] = { correct: 0, total: 0 };
            timesByNumber[trial.actual] = [];
        }
        accuracyByNumber[trial.actual].total++;

        // Bang on is plus one point, one off is plus half a point (let's be generous!)
        if (trial.isCorrect) {
            accuracyByNumber[trial.actual].correct++;
        } else if (Math.abs(trial.guessed - trial.actual) === 1) {
            accuracyByNumber[trial.actual].correct += 0.5;
        }

        // Add the time taken
        timesByNumber[trial.actual].push(trial.time);
    });

    // Display the message as an alert, sorted by number and formatted nicely
    let statsMessage = "Stats:\n\n";
    for (let i = session.minDots; i <= session.maxDots; i++) {
        if (accuracyByNumber[i]) {
            const accuracy = (accuracyByNumber[i].correct / accuracyByNumber[i].total * 100).toFixed(2);
            const avgTime = (timesByNumber[i].reduce((a, b) => a + b, 0) / timesByNumber[i].length).toFixed(2);
            statsMessage += `${i} dots: ${accuracy}% accuracy, avg time ${avgTime}ms\n`;
        }
    }
    alert(statsMessage);
}

// Export maximally detailed statistics as a CSV
function exportStatistics() {
    if (session.trials.length === 0 || typeof session.trials[0] !== 'object') {
        alert("No data available. Play the game first!");
        return;
    }

    // Formats the filename so the user's OS sorts it nicely by time even by default
    const now = new Date();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const fileName = `subitizing-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}-${dayNames[now.getDay()]}-${now.getHours().toString().padStart(2, '0')}-${now.getMinutes().toString().padStart(2, '0')}-${session.minDots}-${session.maxDots}-${session.trialCount}.csv`;

    // CSV header row
    let csvContent = "timestamp,true_value,guessed_value,number_in_session,total_number_in_session,duration_ms\n";

    // Adds a row for each trial
    session.trials.forEach((trial, index) => {
        csvContent += `${trial.timestamp},${trial.actual},${trial.guessed},${index + 1},${session.trials.length},${trial.time}\n`;
    });

    // Downloads the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}