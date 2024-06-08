// Function to generate a Poisson-distributed random number
function poissonRandom(lambda) {
    let L = Math.exp(-lambda);
    let k = 0;
    let p = 1.0;
    do {
        k++;
        p *= Math.random();
    } while (p > L);
    return k - 1;
}

// Initialize the train with a random number of carriages and random light states
let train = [];
let currentPosition = 0;

function initializeTrain() {
    const lambda = 3.5;
    const length = 1 + poissonRandom(lambda); // Ensure at least 1 carriage
    train = new Array(length).fill(false).map(() => Math.random() >= 0.5); // Random lights

    currentPosition = 0;
    console.log("Train initialized:", train); // For debugging
}

// Toggle the light at the current position
function toggleLight() {
    if (train.length === 0) return;
    train[currentPosition] = !train[currentPosition];
    console.log(`Toggled light at position ${currentPosition}:`, train[currentPosition]); // For debugging
}

// Move to the next carriage
function moveToNextCarriage() {
    if (train.length === 0) return;
    currentPosition = (currentPosition + 1) % train.length;
    console.log(`Moved to next carriage. Current position: ${currentPosition}`); // For debugging
}

// Move to the previous carriage
function moveToPreviousCarriage() {
    if (train.length === 0) return;
    currentPosition = (currentPosition - 1 + train.length) % train.length;
    console.log(`Moved to previous carriage. Current position: ${currentPosition}`); // For debugging
}

// Function to pre-cache images
function cacheImages() {
    const images = ['lights_on.png', 'lights_off.png'];
    images.forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

// Call cacheImages when the page loads to ensure images are cached
window.onload = function() {
    initializeTrain();
    cacheImages();
};

// Function to display only the current carriage with a fade transition
function displayTrain() {
    const trainContainer = document.getElementById('train-container');
    trainContainer.innerHTML = ''; // Clear previous content

    const currentCarriage = document.createElement('div');
    currentCarriage.className = 'carriage';
    currentCarriage.style.display = 'block';
    currentCarriage.style.margin = '0 auto';
    currentCarriage.style.width = '60%';

    const img = document.createElement('img');
    img.src = train[currentPosition] ? 'lights_on.png' : 'lights_off.png';
    img.alt = `Carriage ${currentPosition}`;
    img.style.width = '100%';

    // Append the image to the carriage div
    currentCarriage.appendChild(img);
    trainContainer.appendChild(currentCarriage);
}

// Function to update the display with a fade effect when moving between carriages
function updateDisplayWithFade(time) {
    const trainContainer = document.getElementById('train-container');
    const img = trainContainer.querySelector('img');

    if (img) {
        img.classList.add('hidden'); // Fade out the current image
        setTimeout(() => {
            img.src = train[currentPosition] ? 'lights_on.png' : 'lights_off.png';
            img.classList.remove('hidden'); // Fade in the new image
        }, time); // Wait for fade out to complete before changing the image
    } else {
        displayTrain();
    }
}

function doUpArrowTask() {
    moveToNextCarriage();
    updateDisplayWithFade(150);
}

function doDownArrowTask() {
    moveToPreviousCarriage();
    updateDisplayWithFade(150);
}

function doSpaceTask() {
    toggleLight();
    updateDisplayWithFade(10);
}

// Handle key presses for navigation and toggling lights
function handleKeyPress(event) {
    switch (event.key) {
        case 'ArrowUp':
            event.preventDefault();
            doUpArrowTask();
            break;
        case 'ArrowDown':
            event.preventDefault();
            doDownArrowTask();
            break;
        case ' ':
            event.preventDefault();
            doSpaceTask()
            break;
    }
}

// Event listener for key presses
document.addEventListener('keydown', handleKeyPress);

// Ensure there's a container in the HTML to hold the train display
function local_on_body_load () {
    initializeTrain();
    cacheImages();
    displayTrain();
    document.getElementById('answer').innerText = `There were ${train.length} carriages.`;
};