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

                // Update the filename
                const filenameElement = document.querySelector('p:nth-of-type(3)');
                filenameElement.textContent = filenameElement.textContent.replace('(no file uploaded yet)', file.name);

                // Update the timestamp
                const timestampElement = document.querySelector('p:nth-of-type(3)');
                const currentTime = new Date().toLocaleString();
                timestampElement.textContent = timestampElement.textContent.replace('(N/A)', currentTime);

                // Update the hash
                const hashElement = document.querySelector('code span');
                hashElement.textContent = hashHex;
            });
        };

        reader.readAsArrayBuffer(file);
    } else {
        console.log('Please drop a .zip file.');
    }
});

