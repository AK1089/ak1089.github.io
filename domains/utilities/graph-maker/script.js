document.addEventListener('DOMContentLoaded', () => {
    // the SVG object on the canvas
    const draw = SVG().addTo('#canvas').size(800, 600);

    // Create separate layers for background, edges, and nodes
    const backgroundLayer = draw.group();
    const edgeLayer = draw.group();
    const nodeLayer = draw.group();

    // handles the grid (50x50 square by default)
    const gridSize = 50;
    let gridType = 'square';

    // the list of vertices/edges of the graph, and how the nodes should be labelled
    let edges = [];
    let nodes = [];
    let nextLabel = 'A';
    let distanceMatrix = [];

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
    function drawBackground() {
        // clears the previous grid and draws a background
        backgroundLayer.clear();
        backgroundLayer.rect(4000, 3000).fill("#fff").center(2000, 1500);

        // square grids: draw a square lattice (50x50, small circles)
        if (gridType === 'square') {
            for (let x = 0; x <= 4000; x += gridSize) {
                for (let y = 0; y <= 3000; y += gridSize) {
                    backgroundLayer.circle(5).fill('#444').center(x, y);
                }
            }

            // triangular grids: draw a triangular lattice
        } else if (gridType === 'triangular') {
            for (let x = 0; x <= 4000; x += gridSize) {
                for (let y = 0; y <= 3000; y += gridSize) {
                    const offset = (x / gridSize) % 2 === 0 ? 0 : gridSize / 2;
                    backgroundLayer.circle(5).fill('#444').center(x, y + offset);
                }
            }
        }
    }

    function drawEdges() {
        edgeLayer.clear();
        edges.forEach(edge => {
            const line = edgeLayer.line(edge.start.x, edge.start.y, edge.end.x, edge.end.y)
                .stroke({ color: 'black', width: 2 });

            // Add edge length label
            const midX = (edge.start.x + edge.end.x) / 2;
            const midY = (edge.start.y + edge.end.y) / 2;
            edgeLayer.text(edge.length.toString())
                .move(midX, midY)
                .font({ size: 14, anchor: 'middle' })
                .fill('blue');
        });
    }

    function drawNodes() {
        nodeLayer.clear();
        nodes.forEach(node => {
            const group = nodeLayer.group();
            group.circle(40).fill('lightblue').stroke({ width: 2, color: 'black' }).center(node.x, node.y);
            group.text(node.label).move(node.x, node.y - 10).font({ size: 16, anchor: 'middle' });
        });
    }

    // Function to update the distance matrix
    function updateDistanceMatrix() {
        const matrixDiv = document.getElementById('distance-matrix');
        matrixDiv.innerHTML = '';

        const table = document.createElement('table');
        const headerRow = table.insertRow();
        headerRow.insertCell(); // Empty cell for top-left corner

        // Create header row
        nodes.forEach((node, index) => {
            const th = document.createElement('th');
            th.textContent = node.label;
            headerRow.appendChild(th);
        });

        // Create matrix rows
        nodes.forEach((rowNode, rowIndex) => {
            const row = table.insertRow();
            const headerCell = row.insertCell();
            headerCell.textContent = rowNode.label;
            headerCell.style.fontWeight = 'bold';

            nodes.forEach((colNode, colIndex) => {
                const cell = row.insertCell();
                if (rowIndex === colIndex) {
                    cell.textContent = '0';
                } else {
                    const edge = edges.find(e =>
                        (e.start === rowNode && e.end === colNode) ||
                        (e.start === colNode && e.end === rowNode)
                    );
                    const input = document.createElement('input');
                    input.type = 'number';
                    input.min = '0';
                    input.value = edge ? edge.length : '0';
                    input.addEventListener('change', (event) => {
                        const newLength = parseInt(event.target.value);
                        if (newLength > 0) {
                            if (edge) {
                                edge.length = newLength;
                            } else {
                                edges.push({
                                    start: rowNode,
                                    end: colNode,
                                    length: newLength
                                });
                            }
                        } else {
                            if (edge) {
                                edges = edges.filter(e => e !== edge);
                            }
                        }
                        drawEdges();
                        updateDistanceMatrix();
                    });
                    cell.appendChild(input);
                }
            });
        });

        matrixDiv.appendChild(table);
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

        // redraws only the background
        drawBackground();
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
            drawNodes();
            updateDistanceMatrix();
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

            // check if closestNode exists and is not the same as startNode
            if (closestNode && closestNode !== startNode) {

                // create a new edge object
                const edge = {
                    start: startNode,
                    end: closestNode
                };

                // Add the edge to the list of edges
                edges.push(edge);
                drawEdges();
                updateDistanceMatrix();
            }

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
        console.log(nodes);
        console.log(edges);
    });

    // set up the image and centre the view
    drawBackground();
    drawEdges();
    drawNodes();
    updateDistanceMatrix();

    initializePanZoom();
    panZoom.zoom(1);
    panZoom.pan({ x: -1600, y: -1200 });
});