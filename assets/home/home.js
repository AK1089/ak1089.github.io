// Home page carousel: a looping scroll-snap track with arrows and dots, starting on a random card
const carousel = document.querySelector('.home-carousel');
const track = carousel.querySelector('.carousel-track');
const dotBox = carousel.querySelector('.carousel-dots');
const originals = [...track.children];
const n = originals.length;

// Surround the cards with a copy on each side, then jump back to the middle copy whenever
// scrolling settles on one of the outer ones, so the carousel appears to loop forever
const clone = card => {
    const copy = card.cloneNode(true);
    copy.setAttribute('aria-hidden', 'true');
    return copy;
};
track.prepend(...originals.map(clone));
track.append(...originals.map(clone));
const cards = [...track.children];

const dots = originals.map((card, j) => {
    const dot = document.createElement('button');
    dot.setAttribute('aria-label', card.querySelector('strong').textContent);
    dot.addEventListener('click', () => show(current() - (current() % n) + j));
    dotBox.append(dot);
    return dot;
});

function show(i, behavior = 'smooth') {
    const card = cards[Math.max(0, Math.min(i, cards.length - 1))];
    const left = card.offsetLeft - (track.clientWidth - card.clientWidth) / 2;
    track.scrollTo({ left, behavior });
}

// The current card is the one whose centre is closest to the track's centre
function current() {
    const centre = track.scrollLeft + track.clientWidth / 2;
    const distance = card => Math.abs(card.offsetLeft + card.clientWidth / 2 - centre);
    return cards.indexOf(cards.reduce((a, b) => (distance(b) < distance(a) ? b : a)));
}

function mark() {
    const i = current();
    cards.forEach((card, j) => {
        card.classList.toggle('is-current', j === i);
        card.tabIndex = j === i ? 0 : -1;
    });
    dots.forEach((dot, j) => dot.setAttribute('aria-current', j === i % n));
}

function recentre() {
    const i = current();
    if (i >= n && i < 2 * n) return;
    const setWidth = cards[n].offsetLeft - cards[0].offsetLeft;
    track.classList.add('is-jumping');
    track.scrollLeft += i < n ? setWidth : -setWidth;
    mark();
    track.offsetWidth; // flush styles so the jump isn't animated
    track.classList.remove('is-jumping');
}

carousel.querySelectorAll('.carousel-arrow').forEach(arrow => {
    arrow.addEventListener('click', () => show(current() + Number(arrow.dataset.step)));
});

// Clicking a side card brings it to the centre instead of following the link
cards.forEach((card, i) => card.addEventListener('click', event => {
    if (i !== current()) {
        event.preventDefault();
        show(i);
    }
}));

// Only jump once scrolling (including momentum and snapping) has fully stopped
track.addEventListener('scroll', mark, { passive: true });
if ('onscrollend' in window) {
    track.addEventListener('scrollend', recentre);
} else {
    let settle;
    track.addEventListener('scroll', () => {
        clearTimeout(settle);
        settle = setTimeout(recentre, 400);
    }, { passive: true });
}

show(n + Math.floor(Math.random() * n), 'instant');
mark();
