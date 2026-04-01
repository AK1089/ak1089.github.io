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
