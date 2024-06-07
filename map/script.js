async function fetchSiteMap() {
    const response = await fetch('/map/siteMap.json');
    return response.json();
}

function buildHierarchy(siteMap, visitedPages) {
    const root = siteMap.find(page => page.parent === null);
    const map = new Map(siteMap.map(page => [page.url, { ...page, children: [] }]));

    siteMap.forEach(page => {
        if (page.parent && map.has(page.parent)) {
            map.get(page.parent).children.push(map.get(page.url));
        }
    });

    return filterHierarchy(map.get(root.url), visitedPages);
}

function filterHierarchy(node, visitedPages) {
    if (!visitedPages.includes(node.url)) {
        return null;
    }

    node.children = node.children.map(child => filterHierarchy(child, visitedPages)).filter(Boolean);
    return node;
}

function renderTree(data) {
    const margin = { top: 20, right: 120, bottom: 20, left: 120 },
        width = 960 - margin.right - margin.left,
        height = 600 - margin.top - margin.bottom;

    const svg = d3.select("#main-content")
        .append("svg")
        .attr("width", width + margin.right + margin.left)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const root = d3.hierarchy(data);
    const treeLayout = d3.tree().size([height, width]);
    treeLayout(root);

    svg.selectAll('.link')
        .data(root.links())
        .enter()
        .append('path')
        .attr('class', 'link')
        .attr('d', d3.linkHorizontal()
            .x(d => d.y)
            .y(d => d.x));

    const node = svg.selectAll('.node')
        .data(root.descendants())
        .enter()
        .append('g')
        .attr('class', 'node')
        .attr('transform', d => `translate(${d.y},${d.x})`);

    node.append('circle')
        .attr('r', 10);

    node.append('text')
        .attr('dy', '.35em')
        .attr('x', d => d.children ? -13 : 13)
        .style('text-anchor', d => d.children ? 'end' : 'start')
        .text(d => d.data.name);
}

document.addEventListener('DOMContentLoaded', async () => {
    const siteMap = await fetchSiteMap();
    const visitedPages = getVisitedPages();
    const hierarchy = buildHierarchy(siteMap, visitedPages);
    if (hierarchy) {
        renderTree(hierarchy);
    }
});