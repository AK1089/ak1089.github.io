(function () {
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
    ];

    let N, palette, counts, totalDrawn, sinceNew, gameOver;

    function init() {
        N = Math.floor(Math.random() * 10) + 1;
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
        document.getElementById('cc-btn-draw1').disabled = !on;
        document.getElementById('cc-btn-draw10').disabled = !on;
        document.getElementById('cc-btn-draw100').disabled = !on;
        document.getElementById('cc-btn-guess').disabled = !on;
    }

    function draw(n) {
        if (gameOver) return;
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
        let msg = document.getElementById('cc-result-msg');
        if (K === N) {
            msg.innerHTML =
                '<div class="cc-result cc-result-win">Correct! There were ' + N + ' colour' + (N > 1 ? 's' : '') + ' and you found them all in ' + totalDrawn + ' draws.</div>'
                + '<button class="cc-btn" onclick="document.getElementById(\'cc-game-reinit\').click()">Play again</button>';
        } else {
            let missed = palette.filter(c => !counts.has(c.name));
            msg.innerHTML =
                '<div class="cc-result cc-result-lose">Not quite! There were ' + N + ' colour' + (N > 1 ? 's' : '') + ' but you only found ' + K + '. You missed: '
                + missed.map(c => pillHTML(c, c.name)).join(' ')
                + '</div><button class="cc-btn" onclick="document.getElementById(\'cc-game-reinit\').click()">Play again</button>';
        }
    }

    document.getElementById('cc-btn-draw1').addEventListener('click', function () { draw(1); });
    document.getElementById('cc-btn-draw10').addEventListener('click', function () { draw(10); });
    document.getElementById('cc-btn-draw100').addEventListener('click', function () { draw(100); });
    document.getElementById('cc-btn-guess').addEventListener('click', guess);

    // Hidden button for reinit from dynamically created "Play again" buttons
    var reinitBtn = document.createElement('button');
    reinitBtn.id = 'cc-game-reinit';
    reinitBtn.style.display = 'none';
    document.body.appendChild(reinitBtn);
    reinitBtn.addEventListener('click', init);

    init();
})();
