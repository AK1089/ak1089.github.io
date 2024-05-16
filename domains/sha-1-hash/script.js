const dropZone = document.getElementById('drop-zone');

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  e.stopPropagation();
  e.dataTransfer.dropEffect = 'copy';
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  e.stopPropagation();
  const file = e.dataTransfer.files[0];
  if (file.type === 'application/zip') {
    calculateSHA1(file);
  } else {
    alert('Please drop a zip file.');
  }
});

async function calculateSHA1(file) {
  const fileData = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-1', fileData);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  console.log(`SHA-1 hash of ${file.name}: ${hashHex}`);
}