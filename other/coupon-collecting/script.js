(function () {
    /* ── History persistence ── */
    const HISTORY_KEY = 'cc-run-history';

    function loadHistory() {
        try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; }
        catch { return []; }
    }

    function saveRun(n, k, m, gap) {
        const hist = loadHistory();
        hist.push({ n, k, m, gap, ts: Date.now() });
        localStorage.setItem(HISTORY_KEY, JSON.stringify(hist));
    }

    const COLORS = [
        { name: 'crimson', hex: '#E24B4A', bg: '#FCEBEB', tx: '#791F1F' },
        { name: 'blue', hex: '#378ADD', bg: '#E6F1FB', tx: '#0C447C' },
        { name: 'teal', hex: '#1D9E75', bg: '#E1F5EE', tx: '#085041' },
        { name: 'amber', hex: '#BA7517', bg: '#FAEEDA', tx: '#633806' },
        { name: 'purple', hex: '#7F77DD', bg: '#EEEDFE', tx: '#3C3489' },
        { name: 'coral', hex: '#D85A30', bg: '#FAECE7', tx: '#712B13' },
        { name: 'pink', hex: '#D4537E', bg: '#FBEAF0', tx: '#72243E' },
        { name: 'green', hex: '#639922', bg: '#EAF3DE', tx: '#27500A' },
        { name: 'gray', hex: '#888780', bg: '#F1EFE8', tx: '#444441' },
        { name: 'slate blue', hex: '#185FA5', bg: '#E6F1FB', tx: '#042C53' },
        { name: 'scarlet', hex: '#D63031', bg: '#FBEAEA', tx: '#6B1616' },
        { name: 'rose', hex: '#E8707A', bg: '#FDEEF0', tx: '#7A2A31' },
        { name: 'raspberry', hex: '#B5335E', bg: '#F6E5EC', tx: '#5A1A2F' },
        { name: 'maroon', hex: '#8E2444', bg: '#F3E4E9', tx: '#4A1224' },
        { name: 'salmon', hex: '#E8856E', bg: '#FDF0EC', tx: '#7A3B29' },
        { name: 'tangerine', hex: '#E67E22', bg: '#FDF0E2', tx: '#7A410F' },
        { name: 'burnt orange', hex: '#C0582A', bg: '#F8ECE6', tx: '#622C14' },
        { name: 'peach', hex: '#D9885A', bg: '#FAEFE6', tx: '#6E3F22' },
        { name: 'rust', hex: '#A44A2A', bg: '#F4E8E3', tx: '#522514' },
        { name: 'gold', hex: '#CFA014', bg: '#FAF3DA', tx: '#6B5208' },
        { name: 'mustard', hex: '#B8960C', bg: '#F7F1D6', tx: '#5C4B06' },
        { name: 'lemon', hex: '#D4B800', bg: '#FAF6D9', tx: '#6A5C00' },
        { name: 'honey', hex: '#C48B2C', bg: '#F8EFDD', tx: '#644512' },
        { name: 'emerald', hex: '#2EAE6A', bg: '#E3F5EC', tx: '#145A35' },
        { name: 'forest', hex: '#2D7D46', bg: '#E2F0E7', tx: '#153F22' },
        { name: 'lime', hex: '#7CB518', bg: '#EFF6DC', tx: '#3E5B0B' },
        { name: 'olive', hex: '#6B8E23', bg: '#EBF0DE', tx: '#354710' },
        { name: 'mint', hex: '#3DB88C', bg: '#E5F5EF', tx: '#1D5E46' },
        { name: 'sage', hex: '#78946A', bg: '#ECF0E9', tx: '#3C4B34' },
        { name: 'jade', hex: '#28855A', bg: '#E1F0E9', tx: '#13432D' },
        { name: 'cyan', hex: '#17A3A8', bg: '#DFF4F4', tx: '#0A5254' },
        { name: 'turquoise', hex: '#20B2AA', bg: '#E0F5F3', tx: '#105955' },
        { name: 'aqua', hex: '#3EA8C4', bg: '#E4F2F7', tx: '#1D5463' },
        { name: 'sea green', hex: '#2E8B82', bg: '#E1F0EE', tx: '#164641' },
        { name: 'royal blue', hex: '#2D5FD0', bg: '#E5ECFB', tx: '#152F68' },
        { name: 'sky', hex: '#5B9FD6', bg: '#EAF2FA', tx: '#2A5070' },
        { name: 'navy', hex: '#2C3E7B', bg: '#E5E8F0', tx: '#151F3E' },
        { name: 'cerulean', hex: '#2883C4', bg: '#E4F0F8', tx: '#124263' },
        { name: 'steel', hex: '#4A7BA8', bg: '#E8F0F5', tx: '#243D55' },
        { name: 'indigo', hex: '#4B5DBD', bg: '#E9EBFA', tx: '#252F5F' },
        { name: 'violet', hex: '#9B59B6', bg: '#F2EAFA', tx: '#4E2C5C' },
        { name: 'lavender', hex: '#9A85CC', bg: '#F0EDFA', tx: '#4C4268' },
        { name: 'plum', hex: '#8E4585', bg: '#F1E7F0', tx: '#472243' },
        { name: 'mauve', hex: '#9C6B98', bg: '#F1EAF1', tx: '#4E354C' },
        { name: 'grape', hex: '#6C3FA0', bg: '#EBE5F5', tx: '#361F50' },
        { name: 'orchid', hex: '#B06AB3', bg: '#F4EAFA', tx: '#58355A' },
        { name: 'chocolate', hex: '#8B5E3C', bg: '#F1ECE6', tx: '#46301E' },
        { name: 'sienna', hex: '#A0522D', bg: '#F3EAE4', tx: '#502916' },
        { name: 'tan', hex: '#A58D6F', bg: '#F2EFE9', tx: '#534738' },
        { name: 'coffee', hex: '#6F4E37', bg: '#EDE9E4', tx: '#38271C' },
    ];

    let N, palette, counts, totalDrawn, sinceNew, gameOver;

    function sampleN() {
        const weights = [];
        for (let i = 1; i <= COLORS.length; i++) weights.push(Math.pow(0.85, i) + 0.02);
        const total = weights.reduce((a, b) => a + b, 0);
        let r = Math.random() * total;
        for (let i = 0; i < weights.length; i++) {
            r -= weights[i];
            if (r <= 0) return i + 1;
        }
        return weights.length;
    }

    function init() {
        N = sampleN();
        palette = [...COLORS].sort(() => Math.random() - 0.5).slice(0, N);
        counts = new Map();
        totalDrawn = 0;
        sinceNew = 0;
        gameOver = false;
        document.getElementById('cc-n-drawn').textContent = '0';
        document.getElementById('cc-k-seen').textContent = '0';
        document.getElementById('cc-since-new').textContent = '\u2014';
        document.getElementById('cc-colour-counts').innerHTML = '';
        document.getElementById('cc-result-msg').innerHTML = '';
        setButtons(true);
    }

    function setButtons(on) {
        document.getElementById('cc-btn-guess').disabled = !on;
        document.getElementById('cc-btn-replay').style.display = on ? 'none' : '';
    }

    function draw(n) {
        if (gameOver) { init(); draw(n); return; }
        for (let i = 0; i < n; i++) {
            let c = palette[Math.floor(Math.random() * N)];
            let wasNew = !counts.has(c.name);
            counts.set(c.name, (counts.get(c.name) || 0) + 1);
            totalDrawn++;
            if (wasNew) sinceNew = 0; else sinceNew++;
        }
        render();
    }

    function pillHTML(c, text) {
        return '<span class="cc-pill" style="background:' + c.bg + ';color:' + c.tx + ';"><span class="cc-pill-dot" style="background:' + c.hex + ';"></span>' + text + '</span>';
    }

    function render() {
        let K = counts.size;
        document.getElementById('cc-n-drawn').textContent = totalDrawn;
        document.getElementById('cc-k-seen').textContent = K;
        document.getElementById('cc-since-new').textContent = totalDrawn > 0 ? sinceNew : '\u2014';

        let sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
        document.getElementById('cc-colour-counts').innerHTML =
            sorted.map(([name, count]) => pillHTML(palette.find(p => p.name === name), name + ': ' + count)).join('');
    }

    function guess() {
        if (gameOver) return;
        gameOver = true;
        setButtons(false);
        let K = counts.size;
        saveRun(N, totalDrawn, K, sinceNew);
        let msg = document.getElementById('cc-result-msg');
        var were = N === 1 ? 'was' : 'were';
        if (K === N) {
            msg.innerHTML =
                '<div class="cc-result cc-result-win">Correct! There ' + were + ' ' + N + ' coupon' + (N > 1 ? 's' : '') + ' and you found them all in ' + totalDrawn + ' boxes.</div>';
        } else {
            let missed = palette.filter(c => !counts.has(c.name));
            msg.innerHTML =
                '<div class="cc-result cc-result-lose">Not quite! There ' + were + ' ' + N + ' coupon' + (N > 1 ? 's' : '') + ' but you only found ' + K + '. You missed: '
                + missed.map(c => pillHTML(c, c.name)).join(' ')
                + '</div>';
        }
        renderStats();
    }

    document.getElementById('cc-btn-draw1').addEventListener('click', function () { draw(1); });
    document.getElementById('cc-btn-draw10').addEventListener('click', function () { draw(10); });
    document.getElementById('cc-btn-draw100').addEventListener('click', function () { draw(100); });
    document.getElementById('cc-btn-guess').addEventListener('click', guess);
    document.getElementById('cc-btn-replay').addEventListener('click', init);

    /* ── Scatter-plot stats ── */

    function renderStats() {
        var wrap = document.getElementById('cc-history-wrap');
        var chart = document.getElementById('cc-scatter');
        if (!wrap || !chart) return;

        var hist = loadHistory();
        if (hist.length === 0) {
            wrap.style.display = 'none';
            return;
        }

        var wins = hist.filter(r => r.m === r.n).length;
        var summary = document.getElementById('cc-stats-summary');
        summary.textContent = hist.length + ' game' + (hist.length !== 1 ? 's' : '') + ' played  ·  ' + wins + ' correct (' + Math.round(100 * wins / hist.length) + '%)';

        // Axis ranges
        var rawMaxN = Math.max(...hist.map(r => r.n));
        var maxN = rawMaxN >= 10 ? rawMaxN + 1 : 10;
        var maxK = Math.max(...hist.map(r => r.k));

        // Log scale helpers — map k ∈ [1, maxK] to [0, 1]
        var logMax = Math.log(maxK + 4);
        var logMin = Math.log(4);
        function yFrac(k) { return logMax > 0 ? (Math.log(k + 4) - logMin) / (logMax - logMin) : 0; }

        var dotsHTML = '';
        var placed = {};
        for (var i = 0; i < hist.length; i++) {
            var r = hist[i];
            var key = r.n + ',' + r.k;
            if (placed[key]) continue;
            placed[key] = true;
            var x = ((r.n - 0.5) / maxN) * 100;
            var y = (1 - yFrac(r.k)) * 100;
            var cls = r.m === r.n ? 'cc-dot-win' : 'cc-dot-lose';
            var gap = r.gap != null ? r.gap : '?';
            var tip = r.m + '/' + r.n + ' coupons seen in ' + r.k + ' boxes\n' + gap + ' boxes since last new colour';
            dotsHTML += '<div class="cc-dot ' + cls + '" style="left:' + x + '%;top:' + y + '%" data-tip="' + tip.replace(/"/g, '&quot;') + '"></div>';
        }

        // Axis ticks for n (x-axis)
        var xStep = maxN <= 10 ? 1 : Math.ceil(maxN / 10);
        var xTicksHTML = '';
        for (var n = xStep; n <= maxN; n += xStep) {
            var xPos = ((n - 0.5) / maxN) * 100;
            xTicksHTML += '<span class="cc-axis-tick cc-axis-tick-x" style="left:' + xPos + '%">' + n + '</span>';
        }

        // Axis ticks for k (y-axis) — log-spaced nice values
        var yTickVals = [];
        // Add 2, 5, 10, 20, 50, 100, ... up to maxK
        var bases = [1, 2, 5];
        var mag = 1;
        while (true) {
            for (var bi = 0; bi < bases.length; bi++) {
                var v = bases[bi] * mag;
                if (v > 1 && v <= maxK) yTickVals.push(v);
                if (v > maxK) break;
            }
            mag *= 10;
            if (mag > maxK * 10) break;
        }
        var yTicksHTML = '';
        for (var ti = 0; ti < yTickVals.length; ti++) {
            var k = yTickVals[ti];
            var yPos = (1 - yFrac(k)) * 100;
            yTicksHTML += '<span class="cc-axis-tick cc-axis-tick-y" style="top:' + yPos + '%">' + k + '</span>';
        }

        chart.innerHTML = '<div class="cc-scatter-area">' + dotsHTML + '</div>'
            + '<div class="cc-axis-ticks-x">' + xTicksHTML + '</div>'
            + '<div class="cc-axis-ticks-y">' + yTicksHTML + '</div>';

        wrap.style.display = '';
    }

    // Shared tooltip element
    var tooltip = document.createElement('div');
    tooltip.className = 'cc-chart-tooltip';
    document.body.appendChild(tooltip);

    document.addEventListener('mouseover', function (e) {
        var dot = e.target.closest('.cc-dot');
        if (dot && dot.dataset.tip) {
            tooltip.innerHTML = dot.dataset.tip.replace(/\n/g, '<br>');
            tooltip.style.display = 'block';
        }
    });
    document.addEventListener('mouseout', function (e) {
        if (e.target.closest('.cc-dot')) tooltip.style.display = 'none';
    });
    document.addEventListener('mousemove', function (e) {
        if (tooltip.style.display === 'block') {
            tooltip.style.left = e.clientX + 12 + 'px';
            tooltip.style.top = e.clientY - 40 + 'px';
        }
    });

    // Autoplay 1000 games with heuristic: guess when sinceNew > 3 * seen
    var autoBtn = document.getElementById('cc-btn-autoplay');
    if (autoBtn) autoBtn.addEventListener('click', function () {
        for (var g = 0; g < 1000; g++) {
            var n = sampleN();
            var pal = COLORS.slice(0, n);
            var seen = new Set();
            var drawn = 0;
            var gap = 0;
            while (true) {
                var c = pal[Math.floor(Math.random() * n)];
                var wasNew = !seen.has(c.name);
                seen.add(c.name);
                drawn++;
                if (wasNew) gap = 0; else gap++;
                if (gap > 3 * seen.size) break;
            }
            saveRun(n, drawn, seen.size, gap);
        }
        init();
        renderStats();
    });

    // Export history as CSV
    var exportBtn = document.getElementById('cc-btn-export');
    if (exportBtn) exportBtn.addEventListener('click', function () {
        var hist = loadHistory();
        if (hist.length === 0) return;
        var rows = ['total_colours,boxes_opened,colours_found,gap_since_last_new,correct,timestamp'];
        for (var i = 0; i < hist.length; i++) {
            var r = hist[i];
            rows.push(r.n + ',' + r.k + ',' + r.m + ',' + (r.gap != null ? r.gap : '') + ',' + (r.m === r.n ? 'yes' : 'no') + ',' + (r.ts || ''));
        }
        var blob = new Blob([rows.join('\n')], { type: 'text/csv' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'coupon-collecting-history.csv';
        a.click();
        URL.revokeObjectURL(a.href);
    });

    // Clear history
    var clearBtn = document.getElementById('cc-btn-clear');
    if (clearBtn) clearBtn.addEventListener('click', function () {
        if (!confirm('Clear all game history?')) return;
        localStorage.removeItem(HISTORY_KEY);
        document.getElementById('cc-history-wrap').style.display = 'none';
    });

    init();
    renderStats();
})();
