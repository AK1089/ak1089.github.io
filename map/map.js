document.addEventListener('DOMContentLoaded', async () => {
    // Load the map data
    const response = await fetch('/map/map.json');
    const data = await response.json();

    // Set up the SVG
    const container = document.getElementById('map-window');
    const svg = document.getElementById('sitemap-svg');
    const margin = { top: 30, right: 50, bottom: 30, left: 50 };

    // Create the tree layout
    const width = container.clientWidth - margin.left - margin.right;
    const height = container.clientHeight - margin.top - margin.bottom;

    // Convert flat data to hierarchical structure
    const stratify = d3.stratify()
        .id(d => d.url)
        .parentId(d => d.parent);

    const visibleData = data.filter(item => item.display !== false);
    const root = stratify(visibleData)
        .sort((a, b) => a.data.name.localeCompare(b.data.name));

    const estimatedNodeHeight = 40; // Increased to 50px to ensure no overlap
    const totalNodes = root.descendants().length;
    const minHeight = estimatedNodeHeight * (totalNodes / 2);

    const treeLayout = d3.tree()
        .size([Math.max(height, minHeight), width])
        .separation((a, b) => 2.5);

    treeLayout(root);

    // Create the SVG group for transformation
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");

    const zoom = d3.zoom()
        .scaleExtent([0.5, 3])
        .on('zoom', (event) => {
            g.setAttribute('transform', `translate(${event.transform.x},${event.transform.y}) scale(${event.transform.k})`);
        });

    svg.addEventListener('wheel', (e) => e.preventDefault(), { passive: false });
    d3.select(svg).call(zoom);

    const initialTransform = d3.zoomIdentity.translate(40, 10).scale(1);
    d3.select(svg).call(zoom.transform, initialTransform);

    // g.setAttribute("transform", `translate(${margin.left},${margin.top})`);
    svg.appendChild(g);

    // Add the links
    root.links().forEach(link => {
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("class", "sitemap-link");
        path.setAttribute("d", d3.linkHorizontal()
            .x(d => d.y)
            .y(d => d.x)(link));
        g.appendChild(path);
    });

    // Add the nodes
    root.descendants().forEach(node => {
        const nodeGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");

        // URL ignoring hash fragments
        let url = node.data.url;
        if (url.includes('#')) {
            url = url.split('#')[0];
        }

        nodeGroup.setAttribute("class", "sitemap-node");
        if (visitedUrls.has(url)) {
            nodeGroup.classList.add('visited');
        }
        nodeGroup.setAttribute("transform", `translate(${node.y},${node.x})`);

        // Add circle
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        if (visitedUrls.has(url)) {
            circle.classList.add('visited');
        }
        nodeGroup.appendChild(circle);

        // Add text
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("dy", "0.31em");
        // text.setAttribute("x", node.children ? -12 : 12);
        text.setAttribute("y", "1.5em");
        text.setAttribute("x", 0);
        // text.setAttribute("text-anchor", node.children ? "end" : "start");
        text.setAttribute("text-anchor", "middle");
        text.textContent = node.data.name;
        nodeGroup.appendChild(text);

        // Add click handler
        nodeGroup.addEventListener('click', () => {
            window.location.href = url;
        });

        // Add hover handlers for path highlighting
        nodeGroup.addEventListener('mouseover', () => {
            let current = node;
            while (current.parent) {
                const link = g.querySelector(`path[d="${d3.linkHorizontal()
                    .x(d => d.y)
                    .y(d => d.x)({
                        source: current.parent,
                        target: current
                    })}"]`);
                if (link) {
                    link.style.stroke = '#007AFF';
                    link.style.strokeWidth = '2px';
                }
                current = current.parent;
            }
        });

        nodeGroup.addEventListener('mouseout', () => {
            g.querySelectorAll('.sitemap-link').forEach(link => {
                link.style.stroke = '';
                link.style.strokeWidth = '';
            });
        });

        g.appendChild(nodeGroup);
    });

    // Handle window resize
    window.addEventListener('resize', () => {
        const newWidth = container.clientWidth - margin.left - margin.right;
        const newHeight = container.clientHeight - margin.top - margin.bottom;
        const minHeight = calculateMinHeight(root); // Recalculate min height

        treeLayout.size([Math.max(newHeight, minHeight), newWidth]);
        treeLayout(root);

        // Rest of your resize handler code stays the same...
        g.querySelectorAll('.sitemap-node').forEach((node, i) => {
            const data = root.descendants()[i];
            node.setAttribute("transform", `translate(${data.y},${data.x})`);
        });

        g.querySelectorAll('.sitemap-link').forEach((path, i) => {
            const data = root.links()[i];
            path.setAttribute("d", d3.linkHorizontal()
                .x(d => d.y)
                .y(d => d.x)(data));
        });
    });
});