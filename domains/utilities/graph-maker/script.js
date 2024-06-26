document.addEventListener('DOMContentLoaded', () => {
    // the SVG object on the canvas
    const draw = SVG().addTo('#canvas').size(800, 600);

    // create separate layers for background, edges, and nodes
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

    // initialises the pan and zoom functionality
    function initializePanZoom() {
        panZoom = svgPanZoom('#canvas svg', {
            zoomEnabled: true, panEnabled: true,   // allow zooming
            controlIconsEnabled: false,            // they interfere
            fit: false, center: false,             // view settings
            minZoom: 0.2, maxZoom: 8,              // 20% is full view, 800% is very zoomed in
            zoomScaleSensitivity: 0.2,
            dblClickZoomEnabled: false,

            // calculates what to do when panning (resets limits)
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
        const backgroundColor = document.getElementById('background-color').value;
        const gridDotColor = document.getElementById('grid-dot-color').value;
        backgroundLayer.rect(4000, 3000).fill(backgroundColor).center(2000, 1500);

        // square grids: draw a square lattice (50x50, small circles)
        if (gridType === 'square') {
            for (let x = 0; x <= 4000; x += gridSize) {
                for (let y = 0; y <= 3000; y += gridSize) {
                    backgroundLayer.circle(5).fill(gridDotColor).center(x, y);
                }
            }

            // triangular grids: draw a triangular lattice
        } else if (gridType === 'triangular') {
            for (let x = 0; x <= 4000; x += gridSize) {
                for (let y = 0; y <= 3000; y += gridSize) {
                    const offset = (x / gridSize) % 2 === 0 ? 0 : gridSize / 2;
                    backgroundLayer.circle(5).fill(gridDotColor).center(x, y + offset);
                }
            }
        }
    }

    // function to draw the edges of the graph
    function drawEdges() {
        // clear the previous edges
        edgeLayer.clear();
        const edgeColor = document.getElementById('edge-color').value;
        const edgeWidth = document.getElementById('edge-width').value;
        const edgeLabelSize = document.getElementById('edge-label-size').value;
        const edgeLabelColor = document.getElementById('edge-label-color').value;

        // check if all edges have a weight of 1
        const allEdgesWeightOne = edges.every(edge => edge.length === 1);

        // draw each edge
        edges.forEach(edge => {
            const line = edgeLayer.line(edge.start.x, edge.start.y, edge.end.x, edge.end.y)
                .stroke({ color: edgeColor, width: edgeWidth });

            // add the length of the edge in the middle only if not all edges have weight 1
            if (!allEdgesWeightOne) {
                const midX = (edge.start.x + edge.end.x) / 2;
                const midY = (edge.start.y + edge.end.y) / 2;
                edgeLayer.text(edge.length.toString())
                    .move(midX, midY)
                    .font({ size: edgeLabelSize, anchor: 'middle' })
                    .fill(edgeLabelColor);
            }
        });
    }

    // function to draw the nodes of the graph
    function drawNodes() {

        // clear the previous nodes
        nodeLayer.clear();
        const nodeColor = document.getElementById('node-color').value;
        const nodeBorderColor = document.getElementById('node-border-color').value;
        const nodeSize = document.getElementById('node-size').value;
        const nodeBorderWidth = document.getElementById('node-border-width').value;
        const nodeLabelSize = document.getElementById('node-label-size').value;
        const nodeLabelColor = document.getElementById('node-label-color').value;

        // draw each node
        nodes.forEach(node => {
            const group = nodeLayer.group();
            const circle = group.circle(nodeSize)
                .fill(nodeColor)
                .stroke({ width: nodeBorderWidth, color: nodeBorderColor })
                .center(node.x, node.y);

            // add the label of the node
            const text = group.text(node.label)
                .move(node.x, node.y - 10)
                .font({ size: nodeLabelSize, anchor: 'middle' })
                .fill(nodeLabelColor);

            // add context menu event listener
            circle.on('contextmenu', (event) => {
                event.preventDefault();
                deleteNode(node);
            });

            // add context menu event listener
            text.on('contextmenu', (event) => {
                event.preventDefault();
                deleteNode(node);
            });
        });
    }

    function deleteNode(nodeToDelete) {
        // remove the node from the nodes array
        nodes = nodes.filter(node => node !== nodeToDelete);

        // remove all edges connected to this node
        edges = edges.filter(edge => edge.start !== nodeToDelete && edge.end !== nodeToDelete);

        // redraw the graph
        drawNodes();
        drawEdges();
        updateDistanceMatrix();
    }

    // function to update the distance matrix
    function updateDistanceMatrix() {
        const matrixDiv = document.getElementById('distance-matrix');
        matrixDiv.innerHTML = '';

        const table = document.createElement('table');
        const headerRow = table.insertRow();
        headerRow.insertCell(); // empty cell for top-left corner

        // create header row
        nodes.forEach((node, index) => {
            const th = document.createElement('th');
            th.textContent = node.label;
            headerRow.appendChild(th);
        });

        // create matrix rows
        nodes.forEach((rowNode, rowIndex) => {
            const row = table.insertRow();
            const headerCell = row.insertCell();
            headerCell.textContent = rowNode.label;
            headerCell.style.fontWeight = 'bold';

            // for each node, create a cell in the row
            nodes.forEach((colNode, colIndex) => {
                const cell = row.insertCell();

                // nodes can't have an edge to themselves
                if (rowIndex === colIndex) {
                    cell.textContent = '';

                    // find the edge between the two nodes
                } else {
                    const edge = edges.find(e =>
                        (e.start === rowNode && e.end === colNode) ||
                        (e.start === colNode && e.end === rowNode)
                    );

                    // create an input for the user to add or edit the node
                    const input = document.createElement('input');
                    input.type = 'number';
                    input.min = '0';
                    input.value = edge ? edge.length : '0';

                    // when the user changes the value, update the edge
                    input.addEventListener('change', (event) => {
                        const newLength = parseInt(event.target.value);

                        // if the length is positive, update the edge
                        if (newLength > 0) {
                            if (edge) {
                                edge.length = newLength;

                                // if the edge doesn't exist, create it
                            } else {
                                edges.push({
                                    start: rowNode,
                                    end: colNode,
                                    length: newLength
                                });
                            }

                            // if the length is 0, remove the edge
                        } else {
                            if (edge) {
                                edges = edges.filter(e => e !== edge);
                            }
                        }

                        // redraw the edges and update the matrix
                        drawEdges();
                        updateDistanceMatrix();
                    });
                    cell.appendChild(input);
                }
            });
        });

        // add the table to the div
        matrixDiv.appendChild(table);
    }

    // function to update styles based on user input
    function updateStyles() {
        drawBackground();
        drawEdges();
        drawNodes();
    }

    // add event listeners to styling controls
    document.querySelectorAll('#styling-controls input').forEach(input => {
        input.addEventListener('change', updateStyles);
    });

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

        // ignore right-clicks
        if (event.button === 2) return;

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
                    end: closestNode,
                    length: 1
                };

                // add the edge to the list of edges
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

    // toggle styling controls visibility
    const toggleStylingButton = document.getElementById('toggle-styling');
    const stylingControls = document.getElementById('styling-controls');

    toggleStylingButton.addEventListener('click', () => {
        if (stylingControls.style.display === 'none') {
            stylingControls.style.display = 'grid';
            toggleStylingButton.textContent = 'Hide Styling Controls';
        } else {
            stylingControls.style.display = 'none';
            toggleStylingButton.textContent = 'Show Styling Controls';
        }
    });

    // set up the image and centre the view
    drawBackground();

    initializePanZoom();
    panZoom.zoom(1);
    panZoom.pan({ x: -1600, y: -1200 });
});