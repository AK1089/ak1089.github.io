// Adds listeners to the three things which have functionality
function local_on_body_load() {
    document.getElementById('process-button').addEventListener('click', processImage);
    document.getElementById('download-button').addEventListener('click', downloadImage);
    document.getElementById('image-input').addEventListener('change', updateFileLabel);
}

// Updates the file label to show the filename when the user uploads a PNG
function updateFileLabel(event) {
    const file = event.target.files[0];
    if (file) {
        document.getElementById('file-upload-label').textContent = `Uploaded ${file.name}`;
    } else {
        document.getElementById('file-upload-label').textContent = 'You have not yet uploaded a file!';
    }
}

// Gets the k-value from the slider, and calls the function with the file input as target
function processImage() {
    const k = parseInt(document.getElementById('k-slider').value, 10);
    const fileInput = document.getElementById('image-input');
    handleImage({ target: fileInput }, k);
}

// Processes an image
function handleImage(event, k) {

    // Gets the file from the file input
    console.log("handleImage called with k =", k);
    const file = event.target.files[0];
    if (!file) {
        console.log("No file selected.");
        return;
    }

    // Load the file and create an Image object
    const reader = new FileReader();
    reader.onload = function (event) {
        console.log("File loaded.");
        const img = new Image();
        img.onload = function () {

            // When the image loads, draw it on the canvas then retrieve it
            console.log("Image loaded.");
            const canvas = document.getElementById('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            console.log("Image drawn on canvas.");
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            console.log("Image data retrieved from canvas.");

            // Extract the colours: you get one for each pixel
            const colours = getcolours(imageData.data);
            console.log("Extracted colours:", colours.length, "total pixels.");

            // Do k-means clustering on this data
            const clusters = kMeans(colours, k);
            console.log("K-means clustering done with k =", k);

            // Make the image into the new one with k colours and put the data back on the canvas
            const quantisedImageData = quantiseImage(imageData, clusters);
            console.log("Image quantised.");
            ctx.putImageData(quantisedImageData, 0, 0);
            console.log("quantised image data put back on canvas.");

            // Unhide the image to display it
            const outputImage = document.getElementById('output-image');
            outputImage.hidden = false;
            outputImage.src = canvas.toDataURL();
            console.log("Output image updated.");
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

// Gets the colours of a PNG image
function getcolours(data) {
    const colours = [];
    for (let i = 0; i < data.length; i += 4) {
        const colour = [data[i], data[i + 1], data[i + 2]];
        colours.push(colour);
    }
    return colours;
}

// Do k-means clustering on a list
function kMeans(data, k) {
    let centroids = initializeCentroids(data, k);
    let k_clusters = new Array(k);
    let prevCentroids = [];

    while (!arraysEqual(centroids, prevCentroids)) {
        k_clusters = assignClusters(data, centroids);
        prevCentroids = centroids.slice();
        centroids = updateCentroids(k_clusters);
    }

    return centroids;
}

// Initialises the centroids at random (it's still a deterministic algorithm don't worry)
function initializeCentroids(data, k) {
    const centroids = [];
    for (let i = 0; i < k; i++) {
        const randomIndex = Math.floor(Math.random() * data.length);
        centroids.push(data[randomIndex]);
    }
    return centroids;
}

// Assign clusters to each datapoint based on which cluster mean is closest
function assignClusters(data, centroids) {
    const clusters = Array.from({ length: centroids.length }, () => []);
    data.forEach(point => {
        let closestIndex = 0;
        let closestDistance = distance(point, centroids[0]);
        for (let i = 1; i < centroids.length; i++) {
            const dist = distance(point, centroids[i]);
            if (dist < closestDistance) {
                closestDistance = dist;
                closestIndex = i;
            }
        }
        clusters[closestIndex].push(point);
    });
    return clusters;
}

// Update the centroids to the mean of the elements in their cluster
function updateCentroids(clusters) {
    return clusters.map(cluster => {
        if (cluster.length === 0) return [0, 0, 0];
        const sum = cluster.reduce((acc, val) => {
            acc[0] += val[0];
            acc[1] += val[1];
            acc[2] += val[2];
            return acc;
        }, [0, 0, 0]);
        return sum.map(x => Math.floor(x / cluster.length));
    });
}

// Euclidean distance in 3D space by Pythagoras
function distance(point1, point2) {
    return Math.sqrt(
        (point1[0] - point2[0]) ** 2 +
        (point1[1] - point2[1]) ** 2 +
        (point1[2] - point2[2]) ** 2
    );
}

// Function to check if two 2D arrays are equal (returns false if it finds a disrepancy)
function arraysEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;
    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i].length !== arr2[i].length) return false;
        for (let j = 0; j < arr1[i].length; j++) {
            if (arr1[i][j] !== arr2[i][j]) return false;
        }
    }
    return true;
}

// Quantises an image into clusters by assigning each pixel the closest centroid's value
function quantiseImage(imageData, clusters) {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        const colour = [data[i], data[i + 1], data[i + 2]];
        let closestIndex = 0;
        let closestDistance = distance(colour, clusters[0]);
        for (let j = 1; j < clusters.length; j++) {
            const dist = distance(colour, clusters[j]);
            if (dist < closestDistance) {
                closestDistance = dist;
                closestIndex = j;
            }
        }
        const [r, g, b] = clusters[closestIndex];
        data[i] = r;
        data[i + 1] = g;
        data[i + 2] = b;
    }
    return imageData;
}

// Returns the image to the user when they click download, nicely named
function downloadImage() {
    const canvas = document.getElementById('canvas');
    const link = document.createElement('a');
    link.href = canvas.toDataURL();
    const originalFileName = (document.getElementById('image-input').files[0]?.name.split('.').slice(0, -1).join('.') || 'image');
    const k = (parseInt(document.getElementById('k-slider').value, 10) || 'k')
    link.download = `${originalFileName}_${k}_colours.png`;
    link.click();
}