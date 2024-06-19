document.addEventListener('DOMContentLoaded', () => {
    const draw = SVG().addTo('#canvas').size(800, 600);
    const content = draw.group();
    const gridSize = 50;
    let gridType = 'square';

    function drawGrid() {
        content.clear(); // Clear the content

        if (gridType === 'square') {
            for (let x = 0; x <= 4000; x += gridSize) {
                for (let y = 0; y <= 3000; y += gridSize) {
                    content.circle(5).fill('#444').center(x, y);
                }
            }
        } else if (gridType === 'triangular') {
            for (let x = 0; x <= 4000; x += gridSize) {
                for (let y = 0; y <= 3000; y += gridSize) {
                    const offset = (x / gridSize) % 2 === 0 ? 0 : gridSize / 2;
                    content.circle(5).fill('#444').center(x, y + offset);
                }
            }
        }
    }

    function closestLatticePoint(x, y) {
        let snappedX, snappedY;

        if (gridType === 'square') {
            snappedX = Math.round(x / gridSize) * gridSize;
            snappedY = Math.round(y / gridSize) * gridSize;
        } else if (gridType === 'triangular') {
            const row = Math.round(y / (gridSize / 2));
            const col = Math.round(x / gridSize);
            if (row % 2 === 0) {
                snappedX = col * gridSize;
                snappedY = Math.round(y / gridSize) * gridSize;
            } else {
                snappedX = col * gridSize;
                snappedY = Math.floor(y / gridSize) * gridSize + gridSize / 2;
            }
        } else {
            snappedX = x;
            snappedY = y;
        }

        return { x: snappedX, y: snappedY };
    }

    document.getElementById('toggle-grid').addEventListener('click', () => {
        if (gridType === 'square') {
            gridType = 'triangular';
            document.getElementById('toggle-grid').textContent = 'Grid: Triangular';
        } else if (gridType === 'triangular') {
            gridType = 'none';
            document.getElementById('toggle-grid').textContent = 'Grid: None';
        } else {
            gridType = 'square';
            document.getElementById('toggle-grid').textContent = 'Grid: Square';
        }
        drawGrid();
    });

    draw.on('click', function(event) {
        const point = panZoom.getPan();
        const zoom = panZoom.getZoom();
        const x = (event.clientX - draw.node.getBoundingClientRect().left) / zoom - point.x / zoom;
        const y = (event.clientY - draw.node.getBoundingClientRect().top) / zoom - point.y / zoom;
        const closestPoint = closestLatticePoint(x, y);
        console.log(`Closest Lattice Point: (${closestPoint.x}, ${closestPoint.y})`);
    });

    drawGrid();

    // Initialize the svgPanZoom plugin after drawing the grid
    const panZoom = svgPanZoom('#canvas svg', {
        zoomEnabled: true,
        controlIconsEnabled: false,
        fit: false,
        center: false,
        minZoom: 0.2,
        maxZoom: 8,
        zoomScaleSensitivity: 0.2,
        panEnabled: true,
        dblClickZoomEnabled: false,
        beforePan: function (oldPan, newPan) {
            const sizes = this.getSizes();
            const leftLimit = -((sizes.viewBox.width * sizes.realZoom) - sizes.width);
            const rightLimit = 0;
            const topLimit = -((sizes.viewBox.height * sizes.realZoom) - sizes.height);
            const bottomLimit = 0;

            newPan.x = Math.max(leftLimit, Math.min(rightLimit, newPan.x));
            newPan.y = Math.max(topLimit, Math.min(bottomLimit, newPan.y));

            return newPan;
        }
    });
    
    // Center the initial view
    panZoom.zoom(1);
    panZoom.pan({ x: -1600, y: -1200 });
});