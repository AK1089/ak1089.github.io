// Global variables
let portfolioList = [];
let considerationList = [];
let portfolioCash = 0;
let considerationCash = 0;
let graphsCreated = false;
let buyOrders = [];
let sellOrders = [];

function resetEverything() {
    // Clear the portfolios and cash
    portfolioList = [];
    considerationList = [];
    portfolioCash = 0;
    considerationCash = 0;

    // Clear the order book
    buyOrders = [];
    sellOrders = [];

    // Clear input fields
    document.querySelectorAll('#instrument-values input').forEach(input => {
        input.value = '';
    });

    // Reset the instrument type selector to the first option
    document.getElementById('instrument-type').selectedIndex = 0;

    // Update the graphs
    updateGraphs(false);

    // Update the order book display
    displayOrderBook();
}

function clearEverything() {
    considerationList = [];
    considerationCash = 0;

    // Clear input fields
    document.querySelectorAll('#instrument-values input').forEach(input => {
        input.value = '';
    });

    // Reset the instrument type selector to the first option
    document.getElementById('instrument-type').selectedIndex = 0;

    // Update the graphs
    updateGraphs(false);
}

// Function to add an option to the portfolio
function addOption(type, strike, quantity, onlyConsidering) {
    const option = { type, strike, quantity };
    if (onlyConsidering) {
        considerationList.push(option);
    } else {
        portfolioList.push(option);
    }
}

// Function to calculate payoff for a single option
function optionPayoff(option, price) {
    if (option.type === 'call') {
        return Math.max(0, price - option.strike) * option.quantity;
    } else if (option.type === 'put') {
        return Math.max(0, option.strike - price) * option.quantity;
    }
    return 0;
}

// Modified payoff calculation functions
function calculatePortfolioPayoffs(price) {
    const portfolioPayoff = portfolioList.reduce((total, option) => total + optionPayoff(option, price), portfolioCash);
    const considerationPayoff = considerationList.reduce((total, option) => total + optionPayoff(option, price), considerationCash);
    const totalPayoff = portfolioPayoff + considerationPayoff;
    return { portfolioPayoff, considerationPayoff, totalPayoff };
}

// Function to get all critical points (strikes and CI bounds)
function getCriticalPoints() {
    let points = new Set([
        parseFloat(document.getElementById('ci-low').value),
        parseFloat(document.getElementById('ci-high').value)
    ]);
    portfolioList.concat(considerationList).forEach(option => points.add(option.strike));
    return Array.from(points).sort((a, b) => a - b);
}

function updateGraphs(drawConsideration = true) {
    const criticalPoints = getCriticalPoints();
    const payoffs = criticalPoints.map(price => ({
        price,
        ...calculatePortfolioPayoffs(price)
    }));

    const ciLow = parseFloat(document.getElementById('ci-low').value);
    const ciHigh = parseFloat(document.getElementById('ci-high').value);

    // Prepare data for left graph
    const leftData = {
        labels: payoffs.map(p => p.price),
        datasets: [{
            label: 'Payoff of Traded Product',
            data: (drawConsideration ? payoffs.map(p => p.considerationPayoff) : []),
            borderColor: 'blue',
            fill: false
        }]
    };

    // Prepare data for right graph
    const rightData = {
        labels: payoffs.map(p => p.price),
        datasets: [{
            label: 'Total Portfolio Payoff',
            data: payoffs.map(p => p.portfolioPayoff),
            borderColor: 'black',
            fill: false
        },
        {
            label: 'New Portfolio Payoff',
            data: (drawConsideration ? payoffs.map(p => p.totalPayoff) : []),
            borderColor: 'red',
            fill: false
        }]
    };

    // Function to get y-axis range
    function getYAxisRange(data) {
        const min = Math.min(...data);
        const max = Math.max(...data);
        const range = max - min;
        return {
            min: min - range * 0.1,
            max: max + range * 0.1
        };
    }

    // Create or update left graph
    updateChart('left-graph', leftData, ciLow, ciHigh, getYAxisRange(payoffs.map(p => p.considerationPayoff)));

    // Create or update right graph
    updateChart('right-graph', rightData, ciLow, ciHigh, getYAxisRange([...payoffs.map(p => p.portfolioPayoff), ...payoffs.map(p => p.totalPayoff)]));
}

function updateChart(canvasId, data, xMin, xMax, yRange) {
    if (!graphsCreated) {
        createGraphs();
        graphsCreated = true;
        updateChart(canvasId, data, xMin, xMax, yRange);
    }
    window[canvasId].data = data;
    window[canvasId].options.scales.x.min = xMin;
    window[canvasId].options.scales.x.max = xMax;
    window[canvasId].options.scales.y.min = yRange.min;
    window[canvasId].options.scales.y.max = yRange.max;
    window[canvasId].update();
}


function createGraphs() {
    window['left-graph'] = new Chart(document.getElementById('left-graph').getContext('2d'), {
        type: 'line',
        options: {
            scales: {
                x: { type: 'linear', position: 'bottom', min: 0, max: 10 },
                y: { min: 0, max: 10 }
            }, responsive: true, maintainAspectRatio: false
        }
    });

    window['right-graph'] = new Chart(document.getElementById('right-graph').getContext('2d'), {
        type: 'line',
        options: {
            scales: {
                x: { type: 'linear', position: 'bottom', min: 0, max: 10 },
                y: { min: 0, max: 10 }
            }, responsive: true, maintainAspectRatio: false
        }
    });
}

// Event listeners for input fields
document.getElementById('ci-low').addEventListener('input', updateGraphs);
document.getElementById('ci-high').addEventListener('input', updateGraphs);
document.getElementById('instrument-type').addEventListener('change', changeInstrumentType);
document.getElementById('instrument-values').addEventListener('input', updateConsideration);
document.getElementById('clear-button').addEventListener('click', clearEverything);
document.getElementById('reset-button').addEventListener('click', resetEverything);

// Event listener for the "Buy 1" button
document.getElementById('buy-button').addEventListener('click', () => {
    const type = document.getElementById('instrument-type').value;
    const inputs = [...document.querySelectorAll('#instrument-values input')];
    const values = inputs.map(input => parseFloat(input.value));

    // Check if all inputs are filled
    if (!inputs.every(input => input.value.trim() !== '')) return;

    buyProduct(type, values, 1, false);
    updateGraphs();
    addToOrderBook(type, values, true);
});

// Event listener for the "Sell 1" button
document.getElementById('sell-button').addEventListener('click', () => {
    const type = document.getElementById('instrument-type').value;
    const inputs = [...document.querySelectorAll('#instrument-values input')];
    const values = inputs.map(input => parseFloat(input.value));

    // Check if all inputs are filled
    if (!inputs.every(input => input.value.trim() !== '')) return;

    buyProduct(type, values, -1, false);
    updateGraphs();
    addToOrderBook(type, values, false);
});

// Update consideration list
function updateConsideration() {
    const type = document.getElementById('instrument-type').value;
    const inputs = [...document.querySelectorAll('#instrument-values input')];

    // Check if all inputs are filled
    const allInputsFilled = inputs.every(input => input.value.trim() !== '');

    if (allInputsFilled) {
        const values = inputs.map(input => parseFloat(input.value));
        buyProduct(type, values, 1, true);
    } else {
        // Clear the consideration list if not all inputs are filled
        considerationList = [];
        considerationCash = 0;
    }

    updateGraphs(allInputsFilled);
}

// Modified buyProduct function
function buyProduct(type, values, quantity, onlyConsidering) {
    const price = values[values.length - 1];
    if (onlyConsidering) {
        considerationList = []; // Clear the consideration list
        considerationCash = - price * quantity;
    } else {
        portfolioCash -= price * quantity;
    }

    switch (type) {
        case 'stock':
            addOption('call', price, quantity, onlyConsidering);
            addOption('put', price, -quantity, onlyConsidering);
            if (onlyConsidering) { considerationCash = 0; }
            else { portfolioCash += price * quantity; }
            break;
        case 'call-option':
            addOption('call', values[0], quantity, onlyConsidering);
            break;
        case 'put-option':
            addOption('put', values[0], quantity, onlyConsidering);
            break;
        case 'straddle':
            addOption('call', values[0], quantity, onlyConsidering);
            addOption('put', values[0], quantity, onlyConsidering);
            break;
        case 'strangle':
            addOption('call', values[1], quantity, onlyConsidering);
            addOption('put', values[0], quantity, onlyConsidering);
            break;
        case 'call-spread':
            addOption('call', values[0], quantity, onlyConsidering);
            addOption('call', values[1], -quantity, onlyConsidering);
            break;
        case 'put-spread':
            addOption('put', values[0], -quantity, onlyConsidering);
            addOption('put', values[1], quantity, onlyConsidering);
            break;
        case 'call-risk-reversal':
            addOption('call', values[1], quantity, onlyConsidering);
            addOption('put', values[0], -quantity, onlyConsidering);
            break;
        case 'put-risk-reversal':
            addOption('call', values[1], -quantity, onlyConsidering);
            addOption('put', values[0], quantity, onlyConsidering);
            break;
        case 'call-butterfly':
            addOption('call', values[0], quantity, onlyConsidering);
            addOption('call', values[1], -2 * quantity, onlyConsidering);
            addOption('call', values[2], quantity, onlyConsidering);
            break;
        case 'put-butterfly':
            addOption('put', values[0], quantity, onlyConsidering);
            addOption('put', values[1], -2 * quantity, onlyConsidering);
            addOption('put', values[2], quantity, onlyConsidering);
            break;
        case 'call-condor':
            addOption('call', values[0], quantity, onlyConsidering);
            addOption('call', values[1], -quantity, onlyConsidering);
            addOption('call', values[2], -quantity, onlyConsidering);
            addOption('call', values[3], quantity, onlyConsidering);
            break;
        case 'put-condor':
            addOption('put', values[0], quantity, onlyConsidering);
            addOption('put', values[1], -quantity, onlyConsidering);
            addOption('put', values[2], -quantity, onlyConsidering);
            addOption('put', values[3], quantity, onlyConsidering);
            break;
        case 'call-ladder':
            addOption('call', values[0], quantity, onlyConsidering);
            addOption('call', values[1], -quantity, onlyConsidering);
            addOption('call', values[2], -quantity, onlyConsidering);
            break;
        case 'put-ladder':
            addOption('put', values[0], -quantity, onlyConsidering);
            addOption('put', values[1], -quantity, onlyConsidering);
            addOption('put', values[2], quantity, onlyConsidering);
            break;
        case 'call-strip':
            addOption('call', values[0], quantity, onlyConsidering);
            addOption('call', values[0], quantity, onlyConsidering);
            addOption('put', values[0], quantity, onlyConsidering);
            break;
        case 'put-strip':
            addOption('call', values[0], quantity, onlyConsidering);
            addOption('put', values[0], quantity, onlyConsidering);
            addOption('put', values[0], quantity, onlyConsidering);
            break;
        case 'box':
            addOption('call', values[0], quantity, onlyConsidering);
            addOption('put', values[0], -quantity, onlyConsidering);
            addOption('call', values[1], -quantity, onlyConsidering);
            addOption('put', values[1], quantity, onlyConsidering);
            break;
    }
};

function changeInstrumentType() {
    const type = document.getElementById('instrument-type').value;
    let inputHTML = '';

    switch (type) {
        case 'stock':
            inputHTML = 'with a price of <input type="number" class="strike-input">.';
            break;
        case 'call-option':
        case 'put-option':
            inputHTML = 'with a strike of <input type="number" class="strike-input"> for a premium of <input type="number" class="strike-input">.';
            break;
        case 'straddle':
            inputHTML = 'with a strike of <input type="number" class="strike-input"> for a premium of <input type="number" class="strike-input">.';
            break;
        case 'strangle':
        case 'call-spread':
        case 'put-spread':
        case 'call-risk-reversal':
        case 'put-risk-reversal':
            inputHTML = 'with strikes of <input type="number" class="strike-input"> and <input type="number" class="strike-input"> for a premium of <input type="number" class="strike-input">.';
            break;
        case 'call-butterfly':
        case 'put-butterfly':
        case 'call-ladder':
        case 'put-ladder':
            inputHTML = 'with strikes of <input type="number" class="strike-input">, <input type="number" class="strike-input">, and <input type="number" class="strike-input"> for a premium of <input type="number" class="strike-input">.';
            break;
        case 'call-condor':
        case 'put-condor':
            inputHTML = 'with strikes of <input type="number" class="strike-input">, <input type="number" class="strike-input">, <input type="number" class="strike-input">, and <input type="number" class="strike-input"> for a premium of <input type="number" class="strike-input">.';
            break;
        case 'box':
            inputHTML = 'with strikes of <input type="number" class="strike-input"> and <input type="number" class="strike-input"> for a premium of <input type="number" class="strike-input">.';
            break;
    }

    document.getElementById('instrument-values').innerHTML = inputHTML;
    updateGraphs(false);
};

function addToOrderBook(type, values, isBuy) {
    const price = values[values.length - 1] * (isBuy ? 1 : -1);
    const nameValues = values.slice(0, -1).join('/');
    const typeName = document.querySelector(`#instrument-type option[value="${type}"]`).textContent;
    const name = `${nameValues} ${typeName}`;

    const order = { name, price };

    if (isBuy) {
        buyOrders.push(order);
    } else {
        sellOrders.push(order);
    }

    displayOrderBook();
}

function displayOrderBook() {
    const orderBookBody = document.getElementById('order-book-body');
    orderBookBody.innerHTML = ''; // Clear existing rows

    // Combine buy and sell orders
    const allOrders = [...buyOrders, ...sellOrders];

    allOrders.forEach(order => {
        const row = document.createElement('tr');

        const boughtCell = document.createElement('td');
        const soldCell = document.createElement('td');
        const priceCell = document.createElement('td');

        if (order.price > 0) {
            boughtCell.textContent = order.name;
        } else {
            soldCell.textContent = order.name;
        }

        priceCell.textContent = Math.abs(order.price).toFixed(2);

        row.appendChild(boughtCell);
        row.appendChild(soldCell);
        row.appendChild(priceCell);

        orderBookBody.appendChild(row);
    });

    if (allOrders.length === 0) {
        const row1 = document.createElement('tr');
        row1.innerHTML = '<td>​</td><td></td><td></td>';
        orderBookBody.appendChild(row1);
    }

    if (allOrders.length <= 1) {
        const row2 = document.createElement('tr');
        row2.innerHTML = '<td>​</td><td></td><td></td>';
        orderBookBody.appendChild(row2);
    }

    const row3 = document.createElement('tr');
    row3.innerHTML = '<td>​</td><td></td><td></td>';
    orderBookBody.appendChild(row3);
}

// Initial graph update
updateGraphs();
displayOrderBook();