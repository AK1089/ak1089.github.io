// Sets the "set of visited pages" to nothing
function resetVisitedPages() {
    localStorage.setItem('visitedPages', JSON.stringify([]));
    location.reload();
}

// Gets the full site map
async function fetchSiteMap() {
    const response = await fetch('/map/siteMap.json');
    return response.json();
}

// Builds the full tree of pages from the sitemap
function buildHierarchy(siteMap, visitedPages) {

    // The root is the one page without a "parent" entry. Make a map from pages to children
    const root = siteMap.find(page => page.parent === null);
    const map = new Map(siteMap.map(page => [page.url, { ...page, children: [] }]));

    // For each page, find its parent and flag it as its parents child
    siteMap.forEach(page => {
        if (page.parent && map.has(page.parent)) {
            map.get(page.parent).children.push(map.get(page.url));
        }
    });

    // Return only the pages which match the filter
    return filterHierarchy(map.get(root.url), visitedPages);
}

// The filter matches pages which should be displayed
function filterHierarchy(node, visitedPages) {
    node.visited = visitedPages.includes(node.url);

    // Returns null if the parent exists (ie. not root), and neither the parent nor the URL has been visited
    if (!visitedPages.includes(node.url) && !visitedPages.includes(node.parent) && node.parent) {
        return null;
    }

    // Otherwise (ie. home page or a page which has been visited / has a visited parent), add it to the list
    node.children = node.children.map(child => filterHierarchy(child, visitedPages)).filter(Boolean);
    return node;
}

// Creates the SVG based on the page tree
function renderTree(data) {
    const margin = { top: 20, right: 220, bottom: 20, left: 120 },
        width = 960 - margin.right - margin.left,
        height = 600 - margin.top - margin.bottom;

    // Removes existing images, if necessary
    d3.select("#main-content").selectAll("svg").remove();

    // Make a new SVG in the main-content area with the specified dimensions and make it zoomable
    const svg = d3.select("#main-content")
        .append("svg")
        .attr("width", width + margin.right + margin.left)
        .attr("height", height + margin.top + margin.bottom)
        .call(d3.zoom().on("zoom", function (event) {
            svg.attr("transform", event.transform);
        }))
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Create a D3 hierarchy tree
    const root = d3.hierarchy(data);
    const treeLayout = d3.tree().size([height, width]);
    treeLayout(root);

    // Add the link tag to all the paths and specify their endpoints
    svg.selectAll('.link')
        .data(root.links())
        .enter()
        .append('path')
        .attr('class', 'link')
        .attr('d', d3.linkHorizontal()
            .x(d => d.y)
            .y(d => d.x));

    // Make a node with children as processed earlier
    const node = svg.selectAll('.node')
        .data(root.descendants())
        .enter()
        .append('g')
        .attr('class', 'node')
        .attr('transform', d => `translate(${d.y},${d.x})`);

    // Make each circle link to the page it refers to
    node.append('a')
        .attr('xlink:href', d => d.data.url)
        .append('circle')
        .attr('r', 10)
        .attr('class', d => d.data.visited ? 'visited' : 'not-visited');

    // Adds a label with the page name
    node.append('text')
        .attr('dy', '.35em')
        .attr('x', d => d.children ? -13 : 13)
        .style('text-anchor', d => d.children ? 'end' : 'start')
        .text(d => d.data.name);
}


// Reloads the image by getting the site schematic and the cookie then rendering the tree
async function reloadMap() {
    const siteMap = await fetchSiteMap();
    const visitedPages = getVisitedPages();
    const hierarchy = buildHierarchy(siteMap, visitedPages);
    if (hierarchy) {
        renderTree(hierarchy);
    }
};

window.addEventListener('pageshow', async () => { reloadMap() })