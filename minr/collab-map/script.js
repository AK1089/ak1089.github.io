// runs after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {

    // global variables to hold the network data and D3 simulation
    let networkData;
    let simulation;
    let svg, width, height;
    let nodesData, linksData;
    let nodes, links;

    // track which nodes belong to which component
    let componentMap = new Map();

    // DOM elements
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    const nodeInfo = document.getElementById('node-info');
    const infoTitle = document.getElementById('info-title');
    const connectionCount = document.getElementById('connection-count');
    const connectionList = document.getElementById('connection-list');
    const componentSize = document.getElementById('component-size');
    const lastUpdated = document.getElementById('last-updated');
    const nodeCount = document.getElementById('node-count');

    // function to initialise the visualisation
    async function init() {
        try {
            // load the data about the graph from the JSON file
            const response = await fetch('data.json');
            networkData = await response.json();

            // update the text and node count in the footer
            lastUpdated.textContent = networkData.lastUpdated || 'N/A';
            nodeCount.textContent = networkData.nodes.length;

            // create the SVG element and prepare the data
            setupSVG();
            nodesData = networkData.nodes;
            linksData = networkData.links;

            // run functions which prepare the data for view
            identifyComponents();
            createVisualisation();
            setupEventListeners();

            // if there is an error in the data, show an alert
        } catch (error) {
            console.error('Error initialising visualisation:', error);
            alert('Failed to load network data. Please check the console for details.');
        }
    }

    // set up the SVG element and its dimensions
    function setupSVG() {
        svg = d3.select('#network-graph');
        const container = document.querySelector('.graph-container');
        width = container.clientWidth;
        height = container.clientHeight;

        // create the SVG element
        svg
            .attr('width', width)
            .attr('height', height)
            .attr('viewBox', [0, 0, width, height])
            .attr('style', 'max-width: 100%; height: auto;');

        // add zoom functionality
        const zoom = d3.zoom()
            .scaleExtent([0.3, 4])
            .on('zoom', (event) => {
                svg.select('g').attr('transform', event.transform);
            });

        svg.call(zoom);

        // add a tooltip div
        d3.select('body').append('div')
            .attr('class', 'tooltip')
            .style('opacity', 0);
    }

    // identify the connected components in the network
    function identifyComponents() {
        // map from node IDs to their positions in the nodes array
        const nodeMap = new Map(nodesData.map((node, index) => [node.id, index]));

        // create an adjacency list and degree map
        const adj = Array(nodesData.length).fill().map(() => []);
        const degreeMap = new Map();

        linksData.forEach(link => {
            const sourceIndex = nodeMap.get(link.source);
            const targetIndex = nodeMap.get(link.target);
            adj[sourceIndex].push(targetIndex);
            adj[targetIndex].push(sourceIndex);
            degreeMap.set(link.source, (degreeMap.get(link.source) || 0) + 1);
            degreeMap.set(link.target, (degreeMap.get(link.target) || 0) + 1);
        });

        // store the degree of each node in the nodesData array
        nodesData.forEach(node => {
            node.degree = degreeMap.get(node.id) || 0; // store it in node.degree
        });

        // perform DFS to identify components
        const visited = Array(nodesData.length).fill(false);
        let componentId = 0;

        // iterate through all nodes
        for (let i = 0; i < nodesData.length; i++) {
            if (!visited[i]) {
                const component = [];
                dfs(i, visited, adj, component);

                // mark all nodes in this component
                component.forEach(nodeIndex => {
                    nodesData[nodeIndex].componentId = componentId;
                    componentMap.set(nodesData[nodeIndex].id, {
                        componentId,
                        componentSize: component.length
                    });
                });

                // increment the component ID for the next component
                componentId++;
            }
        }

        // helper function for DFS
        function dfs(node, visited, adj, component) {
            visited[node] = true;
            component.push(node);

            for (const neighbor of adj[node]) {
                if (!visited[neighbor]) {
                    dfs(neighbor, visited, adj, component);
                }
            }
        }
    }

    // index tracker for search result navigation
    let currentSearchResultIndex = -1;

    // navigate through search results with arrow keys
    function navigateSearchResults(direction) {
        const searchItems = searchResults.querySelectorAll('.search-result-item');
        if (searchItems.length === 0) return;

        // remove the current highlight
        searchItems.forEach(item => item.classList.remove('highlighted'));

        // calculate the new index
        if (currentSearchResultIndex === -1) {
            currentSearchResultIndex = direction > 0 ? 0 : searchItems.length - 1;
        } else {
            currentSearchResultIndex += direction;
            if (currentSearchResultIndex >= searchItems.length) {
                currentSearchResultIndex = 0;
            } else if (currentSearchResultIndex < 0) {
                currentSearchResultIndex = searchItems.length - 1;
            }
        }

        // apply the new correct highlights
        const selectedItem = searchItems[currentSearchResultIndex];
        selectedItem.classList.add('highlighted');

        // scroll into view if necessary
        selectedItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }

    // select the currently highlighted search result
    function selectHighlightedSearchResult() {
        const highlightedItem = searchResults.querySelector('.search-result-item.highlighted');
        if (highlightedItem) {
            highlightedItem.click();
        } else if (searchResults.children.length === 1) {
            // if there's only one result, select it automatically
            searchResults.children[0].click();
        }
    }

    // create the D3 force simulation and visualisation
    function createVisualisation() {
        // create a container group for the network
        const container = svg.append('g');

        // create the force simulation - optimised for larger networks
        simulation = d3.forceSimulation(nodesData)
            .force('link', d3.forceLink(linksData)
                .id(d => d.id)
                .distance(80)
            )
            .force('charge', d3.forceManyBody()
                .strength(-300)
                .theta(0.9)
                .distanceMax(800)
            )
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force('collision', d3.forceCollide().radius(30))
            .velocityDecay(0.8)
            .alphaDecay(0.088);

        // add the links between nodes
        links = container.append('g')
            .attr('class', 'links')
            .selectAll('line')
            .data(linksData)
            .enter()
            .append('line')
            .attr('class', 'link')
            .attr('stroke-width', d => d.value)
            .attr('marker-end', d => `url(#arrow-${d.id})`);

        // add the nodes themselves
        const nodeContainer = container.append('g')
            .attr('class', 'nodes');

        // container for the nodes which reacts to drag events
        nodes = nodeContainer.selectAll('.node')
            .data(nodesData)
            .enter()
            .append('g')
            .attr('class', 'node')
            .call(d3.drag()
                .on('start', dragStarted)
                .on('drag', dragging)
                .on('end', dragEnded)
            );

        // function to scale the size of the nodes based on their degree
        const sizeScale = d3.scaleLinear()
            .domain(d3.extent(nodesData, d => d.degree))
            .range([7, 16]);

        // add display circles to each node
        nodes.append('circle')
            .attr('r', d => sizeScale(d.degree));

        // add labels underneath each node
        nodes.append('text')
            .attr('dx', 0)
            .attr('dy', d => sizeScale(d.degree) + 12)
            .text(d => d.name)
            .attr('font-size', '10px')
            .attr('text-anchor', 'middle');

        // runs each frame of the simulation to update the positions of nodes and links
        simulation.on('tick', () => {
            // constrain node positions to stay within boundaries
            // nodesData.forEach(d => {
            //     d.x = Math.max(15, Math.min(width - 15, d.x));
            //     d.y = Math.max(15, Math.min(height - 15, d.y));
            // });

            // update link positions based on the node positions
            links
                .attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y);

            // update node positions
            nodes.attr('transform', d => `translate(${d.x},${d.y})`);
        });

        // start the simulation with a gentle initial movement
        simulation.alpha(0.3).restart();

        // separate disconnected components to avoid component overlap
        separateComponents();
    }

    // helper function to separate disconnected components
    function separateComponents() {
        // first, group the nodes by component
        const componentGroups = {};
        nodesData.forEach(node => {
            if (!componentGroups[node.componentId]) {
                componentGroups[node.componentId] = [];
            }
            componentGroups[node.componentId].push(node);
        });

        // position each component in a grid layout
        const componentCount = Object.keys(componentGroups).length;
        const cols = Math.ceil(Math.sqrt(componentCount));
        const rows = Math.ceil(componentCount / cols);

        const cellWidth = width / cols;
        const cellHeight = height / rows;

        let index = 0;
        for (const componentId in componentGroups) {
            const row = Math.floor(index / cols);
            const col = index % cols;

            const centerX = col * cellWidth + cellWidth / 2;
            const centerY = row * cellHeight + cellHeight / 2;

            // add a weak force to pull component nodes toward their cell center
            simulation.force(`component-${componentId}`,
                d3.forceRadial(50, centerX, centerY)
                    .strength(node => node.componentId === parseInt(componentId) ? 0.2 : 0)
            );

            index++;
        }

        // restart the simulation with the new forces
        simulation.alpha(2).restart();
    }

    // set up event listeners for interactivity
    function setupEventListeners() {
        // node hover and click events
        nodes.on('mouseover', (event, d) => {
            highlightConnections(d);
        })
            .on('mouseout', (event, d) => {
                if (!d.selected) {
                    removeHighlights();
                }
            })
            .on('click', (event, d) => {
                event.stopPropagation();
                selectNode(d);
            });

        // connection list item clicks
        connectionList.addEventListener('click', event => {
            if (event.target.tagName === 'LI') {
                const nodeId = event.target.dataset.id;
                const node = nodesData.find(n => n.id === nodeId);
                if (node) {
                    selectNode(node);
                }
            }
        });

        // background click to deselect the current node
        svg.on('click', () => {
            removeHighlights();
            nodesData.forEach(node => node.selected = false);
            nodeInfo.classList.remove('visible');
        });

        // search functionality
        searchInput.addEventListener('input', updateSearchResults);
        searchInput.addEventListener('keydown', event => {
            if (event.key === 'Escape') {
                closeSearch();
            } else if (event.key === 'ArrowDown') {
                navigateSearchResults(1);
                event.preventDefault();
            } else if (event.key === 'ArrowUp') {
                navigateSearchResults(-1);
                event.preventDefault();
            } else if (event.key === 'Enter') {
                selectHighlightedSearchResult();
                event.preventDefault();
            }
        });

        // global key events for showing search
        document.addEventListener('keydown', event => {
            if (event.key === 'Escape') {
                if (searchResults.classList.contains('visible')) {
                    closeSearch();
                } else {
                    showSearch();
                }
            }
        });

        // window resize event: update the SVG dimensions on resize then the simulation
        window.addEventListener('resize', debounce(() => {
            setupSVG();
            simulation.force('center', d3.forceCenter(width / 2, height / 2));
            simulation.alpha(0.3).restart();

            // separate the components again
            separateComponents();
        }, 250));
    }

    // highlight a node and its connections
    function highlightConnections(node) {
        node.highlighted = true;

        // find the connected links and nodes
        const connectedLinks = linksData.filter(
            link => link.source.id === node.id || link.target.id === node.id
        );

        const connectedNodes = new Set();
        connectedLinks.forEach(link => {
            if (link.source.id === node.id) {
                connectedNodes.add(link.target.id);
            } else if (link.target.id === node.id) {
                connectedNodes.add(link.source.id);
            }
        });

        // highlight the primary node differently than connected nodes
        nodes.classed('primary-highlight', d => d.id === node.id);

        // highlight the other (secondary) connected nodes
        nodes.classed('highlighted', d =>
            d.id !== node.id && connectedNodes.has(d.id)
        );

        // highlight connected links
        links.classed('highlighted', link =>
            link.source.id === node.id || link.target.id === node.id
        );
    }

    // remove all highlights
    function removeHighlights() {
        nodes.classed('highlighted', false);
        nodes.classed('primary-highlight', false);
        links.classed('highlighted', false);
        nodesData.forEach(node => node.highlighted = false);
    }

    // select a node and show its details
    function selectNode(node) {
        // reset all nodes
        nodesData.forEach(n => n.selected = false);

        // mark this node as selected
        node.selected = true;

        // highlight connections
        highlightConnections(node);

        // get connected nodes
        const connections = [];
        linksData.forEach(link => {
            if (link.source.id === node.id) {
                connections.push({ node: link.target, value: link.value });
            } else if (link.target.id === node.id) {
                connections.push({ node: link.source, value: link.value });
            }
        });

        connections.sort((a, b) => {
            // compare by value descending
            if (b.value !== a.value) {
                return b.value - a.value;
            }
            // tie-break: alphabetical by name
            return a.node.name.localeCompare(b.node.name);
        });

        // update the info panel
        infoTitle.textContent = node.name;
        connectionCount.textContent = connections.length;

        // get component info
        const componentInfo = componentMap.get(node.id);
        componentSize.textContent = componentInfo ? componentInfo.componentSize : 1;

        // update connections list
        connectionList.innerHTML = '';
        connections.forEach(conn => {
            const li = document.createElement('li');
            const linkName = conn.node.name || conn.node.id;
            // only add the "(xN)" if conn.value != 1
            li.textContent = conn.value === 1 ? linkName : `${linkName} (x${conn.value})`;
            li.dataset.id = conn.node.id;
            connectionList.appendChild(li);
        });

        // show the info panel
        nodeInfo.classList.add('visible');

        // focus the simulation on this node
        simulation.alphaTarget(0.1).restart();

        // gently move the view to center on this node
        const transform = d3.zoomTransform(svg.node());
        const scale = transform.k;
        const tx = width / 2 - scale * node.x;
        const ty = height / 2 - scale * node.y;

        svg.transition().duration(750)
            .call(
                d3.zoom().transform,
                d3.zoomIdentity.translate(tx, ty).scale(scale)
            );
    }

    // update search results based on input
    function updateSearchResults() {
        const query = searchInput.value.trim().toLowerCase();

        if (query.length < 2) {
            searchResults.innerHTML = '';
            searchResults.classList.remove('visible');
            currentSearchResultIndex = -1;
            return;
        }

        // find all matching nodes
        const matches = nodesData.filter(node =>
            node.name.toLowerCase().includes(query)
        );

        // update the search results
        searchResults.innerHTML = '';
        currentSearchResultIndex = -1;

        if (matches.length > 0) {
            matches.forEach(node => {
                const div = document.createElement('div');
                div.className = 'search-result-item';
                div.textContent = node.name;
                div.dataset.id = node.id;
                div.addEventListener('click', () => {
                    selectNode(node);
                    closeSearch();
                });
                searchResults.appendChild(div);
            });
            searchResults.classList.add('visible');
        } else {
            searchResults.classList.remove('visible');
        }
    }

    // show the search bar (runs when Escape is pressed)
    function showSearch() {
        searchInput.focus();
    }

    // close search
    function closeSearch() {
        searchInput.value = '';
        searchResults.innerHTML = '';
        searchResults.classList.remove('visible');
        searchInput.blur();
        currentSearchResultIndex = -1;
    }

    // drag functions
    function dragStarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragging(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    function dragEnded(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    // helper function to debounce function calls
    function debounce(func, wait) {
        let timeout;
        return function (...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }

    // start the application
    init();
});