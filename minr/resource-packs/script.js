const downloadArea = document.getElementById('userDownloadArea');
const dropZoneArea = document.getElementById('dropZoneArea');
const dropZone = document.getElementById('dropZone');

const fileInput = document.getElementById('fileInput');
const hashOutput = document.getElementById('hashOutput');
const resultArea = document.getElementById('resultArea');

const usernameInput = document.getElementById('ghusername');
const repoInput = document.getElementById('ghreponame');
const mapInput = document.getElementById('mapCode');

const userFilename = document.getElementById('userFilename');
const downloadLink = document.getElementById('userDownload');

// Function to hash a file and replace the hex
async function calculateSHA1(file) {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-1', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b =>
        b.toString(16).padStart(2, '0')
    ).join('');

    const username = usernameInput.value.trim();
    const repo = repoInput.value.trim().replace(" ", "-");
    const code = mapInput.value.trim();

    resultArea.style.display = 'block';
    hashOutput.textContent = `/map resource-pack set ${code} https://github.com/${username}/${repo}/archive/refs/heads/main.zip ${hashHex}`
}

// Handle drag and drop
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragging');
});

dropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragging');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragging');

    const file = e.dataTransfer.files[0];
    if (file) {
        calculateSHA1(file);
    }
});

// Handle click to select
dropZone.addEventListener('click', () => {
    fileInput.click();
});

// Update command when a file is uploaded
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        calculateSHA1(file);
    }
});

// Function to update the href attribute
function updateDownloadLink() {
    const username = usernameInput.value.trim();
    const repo = repoInput.value.trim().replace(" ", "-");
    const code = mapInput.value.trim();

    downloadLink.href = `https://github.com/${username}/${repo}/archive/refs/heads/main.zip`;
    userFilename.setAttribute('data-filename', `${repo}-main.zip`);

    // Show download area when all filled in
    if (username && repo && code) downloadArea.style.display = 'block';
}

// Add event listeners for both inputs
usernameInput.addEventListener('input', updateDownloadLink);
repoInput.addEventListener('input', updateDownloadLink);
mapInput.addEventListener('input', updateDownloadLink);

// Show file drop area when download is done
downloadLink.addEventListener('click', () => {
    dropZoneArea.style.display = 'block';
});
