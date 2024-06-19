document.addEventListener('DOMContentLoaded', () => {
    // the SVG object on the canvas
    const draw = SVG().addTo('#canvas').size(800, 600);
    const content = draw.group();

    // handles the grid (50x50 square by default)
    const gridSize = 50;
    let gridType = 'square';

    // the list of vertices of the graph, and how they should be labelled
    let nodes = [];
    let nextLabel = 'A';

    // flags for the dragging and moving behaviour
    let mouseDownDraggingNotFromNode = false;
    let userMovedImageSinceMouseUp = false;
    let isDraggingFromNode = false;

    // settings for the viewport
    let panZoom;
    let panEnabled = true;

    // faded line
    let dragLine = draw.line().stroke({ width: 2, color: 'gray', opacity: 0.5 }).hide();
    let startNode;

    function initializePanZoom() {
        panZoom = svgPanZoom('#canvas svg', {
            zoomEnabled: true, panEnabled: true,   // allow zooming
            controlIconsEnabled: false,            // they interfere
            fit: false, center: false,             // view settings
            minZoom: 0.2, maxZoom: 8,              // 20% is full view, 800% is very zoomed in
            zoomScaleSensitivity: 0.2,
            dblClickZoomEnabled: false,

            // calculates what to do when panning (resets likmits)
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
    }

    // creates the grid of lattice points 
    function drawGrid() {

        // clears the previous grid and draws a background
        content.clear()
        content.rect(4000, 3000).fill("#fff").center(2000, 1500)

        // square grids: draw a square lattice (50x50, small circles)
        if (gridType === 'square') {
            for (let x = 0; x <= 4000; x += gridSize) {
                for (let y = 0; y <= 3000; y += gridSize) {
                    content.circle(5).fill('#444').center(x, y);
                }
            }

            // triangular grids: draw a triangular lattice
        } else if (gridType === 'triangular') {
            for (let x = 0; x <= 4000; x += gridSize) {
                for (let y = 0; y <= 3000; y += gridSize) {
                    const offset = (x / gridSize) % 2 === 0 ? 0 : gridSize / 2;
                    content.circle(5).fill('#444').center(x, y + offset);
                }
            }
        }

        // redraw existing nodes
        nodes.forEach(node => {
            const group = content.group();
            group.circle(40).fill('lightblue').stroke({ width: 2, color: 'black' }).center(node.x, node.y);
            group.text(node.label).move(node.x, node.y - 10).font({ size: 16, anchor: 'middle' });
        });
    }

    // gets the x and y position of the mouse relative to the image
    function getMousePosition(event) {
        const point = panZoom.getPan();
        const zoom = panZoom.getZoom();
        const x = (event.clientX - draw.node.getBoundingClientRect().left) / zoom - point.x / zoom;
        const y = (event.clientY - draw.node.getBoundingClientRect().top) / zoom - point.y / zoom;
        return { x, y };
    }

    // get the closest lattice point for snapping purposes
    function closestLatticePoint(x, y) {
        let snappedX, snappedY;

        // it's easy for squares - just round the values
        if (gridType === 'square') {
            snappedX = Math.round(x / gridSize) * gridSize;
            snappedY = Math.round(y / gridSize) * gridSize;

            // for triangles, it's a bit more complex
        } else if (gridType === 'triangular') {
            const col = Math.round(x / gridSize);
            snappedX = col * gridSize;

            // for even columns, just do it as normal - for odd columns, we require an offset
            if (col % 2 === 0) {
                snappedY = Math.round(y / gridSize) * gridSize;
            } else {
                snappedY = Math.floor(y / gridSize) * gridSize + gridSize / 2;
            }

            // if there's no grid, we don't need to do any snapping
        } else {
            snappedX = x;
            snappedY = y;
        }

        return { x: snappedX, y: snappedY };
    }

    // gets the closest node to a point
    function getClosestNode(closestPoint) {
        for (let node of nodes) {
            if (Math.hypot(node.x - closestPoint.x, node.y - closestPoint.y) < gridSize / 2) {
                return node;
            }
        }
        return null;
    }

    // toggles the grid on button press: adds this listener to the grid button
    document.getElementById('toggle-grid').addEventListener('click', () => {

        // changes grid type and label
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

        // redraws the grid
        drawGrid();
    });

    // runs when the user clicks on the SVG (technically at mouse up but after the mouseup event)
    draw.on('click', function (event) {

        // if we've just dragged the viewport around, then ignore this event
        if (userMovedImageSinceMouseUp || isDraggingFromNode) {
            userMovedImageSinceMouseUp = false;
            isDraggingFromNode = false;
            return;
        }

        // gets the closest lattice point to where we've clicked
        const { x, y } = getMousePosition(event);
        const closestPoint = closestLatticePoint(x, y);

        // check if the click is on an existing node
        const closestNode = getClosestNode(closestPoint);

        // if not, add a new node at the position given
        if (!closestNode) {
            nodes.push({ x: closestPoint.x, y: closestPoint.y, label: nextLabel });
            nextLabel = String.fromCharCode(nextLabel.charCodeAt(0) + 1);
            drawGrid();
        }
    });

    // runs when the user clicks their mouse down on the SVG
    draw.on('mousedown', function (event) {

        // gets the closest lattice point to where we've clicked
        const { x, y } = getMousePosition(event);
        const closestPoint = closestLatticePoint(x, y);

        // check if the mousedown is on an existing node - if so, store its position
        const closestNode = getClosestNode(closestPoint);

        // if so, we shouldn't let them drag the image
        if (closestNode) {
            panZoom.disablePan();
            mouseDownDraggingNotFromNode = false;
            isDraggingFromNode = true;
            startNode = closestNode

            // show the faded line 
            dragLine.plot(startNode.x, startNode.y, startNode.x, startNode.y).show();
        } else {
            mouseDownDraggingNotFromNode = true;
            isDraggingFromNode = false
        }
    });

    // re-enables pan if necessary, and resets the dragging flags
    draw.on('mouseup', function (event) {
        const { x, y } = getMousePosition(event);
        mouseDownDraggingNotFromNode = false;

        // if we've been dragging the line around, then hide it
        if (isDraggingFromNode) {
            dragLine.hide()

            // get the closest node
            const closestNode = getClosestNode(closestLatticePoint(x, y));
            console.log(startNode);
            console.log(closestNode);

            // TODO - ADD A LINE BETWEEN startNode AND closestNode
            // ...

        }

        // if pan is supposed to be enabled, re-enable it
        if (panEnabled) {
            panZoom.enablePan();
        }
    });

    // if the user is dragging around
    draw.on('mousemove', function (event) {

        // if they're dragging from a node, update the position of the faded line
        if (isDraggingFromNode) {
            const { x, y } = getMousePosition(event);
            dragLine.plot(startNode.x, startNode.y, x, y);

        // otherwise, set the flag to note we've been actually moving the image position
        } else if (mouseDownDraggingNotFromNode) {
            userMovedImageSinceMouseUp = true;
        }
    });

    // lock viewport button
    document.getElementById('lock-viewport-button').addEventListener('click', () => {
        if (panEnabled) {
            panZoom.disablePan();
            panZoom.disableZoom();
            document.getElementById('lock-viewport-button').textContent = 'Unlock Viewport';
        } else {
            panZoom.enablePan();
            panZoom.enableZoom();
            document.getElementById('lock-viewport-button').textContent = 'Lock Viewport';
        }
        panEnabled = !panEnabled;
    });

    // set up the image and centre the view
    drawGrid();
    initializePanZoom();
    panZoom.zoom(1);
    panZoom.pan({ x: -1600, y: -1200 });
});