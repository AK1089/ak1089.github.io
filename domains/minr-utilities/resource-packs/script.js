document.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
});

document.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files[0];

    if (file.type === 'application/zip') {
        const reader = new FileReader();

        reader.onload = () => {
            const arrayBuffer = reader.result;
            const hashBuffer = crypto.subtle.digest('SHA-1', arrayBuffer);

            hashBuffer.then((hash) => {
                const hashArray = Array.from(new Uint8Array(hash));
                const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

                // Update the filename, timestamp, and hash using the element ID
                const fileHashInfo = document.getElementById('file-hash-info');
                const currentTime = new Date().toLocaleString();
                fileHashInfo.textContent = `You uploaded ${file.name} at ${currentTime}. Its SHA-1 Hash is:`;

                // Update the hash using the data-language attribute
                const hashElement = document.querySelector('code[data-language="hash"] span');
                hashElement.textContent = hashHex;
            });
        };

        reader.readAsArrayBuffer(file);
    } else {
        console.log('Please drop a .zip file.');
    }
});