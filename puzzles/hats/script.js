(function () {
  const BLACK = "#262525";
  const WHITE = "#ffffff";
  const figures = document.querySelectorAll(".hats-figure:not([data-colours])");

  const parity = (n) => (n % 2 ? "odd" : "even");
  const colour = (n) => (n % 2 ? "black" : "white");
  const blackFrom = (hats, start) => hats.slice(start).filter(Boolean).length;

  // Bubble text for each guesser, given the hats (true = black)
  const SCRIPTS = {
    0(hats) {
      const seen = blackFrom(hats, 1);
      const noun = seen === 1 ? "hat" : "hats";
      return { lines: [`I see ${seen} black ${noun}: ${parity(seen)}.`], say: colour(seen) };
    },
    1(hats) {
      const heard = blackFrom(hats, 1);
      const seen = blackFrom(hats, 2);
      const mine = colour(heard - seen);
      const link = heard % 2 === seen % 2 ? "and" : "but";
      return {
        lines: [`He saw an ${parity(heard)} number of black hats,`, `${link} I see ${seen}, so mine must be ${mine}.`],
        say: mine,
      };
    },
  };

  function render(figure, hats) {
    const g = figure.dataset.guesser;
    const guesser = g === undefined ? Infinity : Number(g);
    const glow = figure.querySelector("filter")?.id;

    // Highlight the black hats the guesser can see
    figure.querySelectorAll(".hat").forEach((hat, i) => {
      hat.setAttribute("fill", hats[i] ? BLACK : WHITE);
      if (i > guesser && hats[i]) hat.setAttribute("filter", `url(#${glow})`);
      else hat.removeAttribute("filter");
    });
    if (g === undefined) return;

    const { lines, say } = SCRIPTS[g](hats);
    figure.querySelectorAll(".hats-line").forEach((tspan, i) => (tspan.textContent = lines[i]));
    figure.querySelector(".hats-say").textContent = say[0].toUpperCase() + say.slice(1) + "!";
  }

  // Draw p ~ U[0, 1], then each hat is black with probability p
  function reroll() {
    const p = Math.random();
    const hats = Array.from({ length: 10 }, () => Math.random() < p);
    figures.forEach((figure) => render(figure, hats));
  }

  // Draw weights ~ Dirichlet(1, ..., 1), then each hat's colour from them (k = 2 is the reroll above)
  function rerollColours(figure) {
    const colours = figure.dataset.colours.split(",");
    const weights = colours.map(() => -Math.log(1 - Math.random()));
    const total = weights.reduce((a, b) => a + b);
    figure.querySelectorAll(".hat").forEach((hat) => {
      let r = Math.random() * total;
      let i = 0;
      while (i < colours.length - 1 && r > weights[i]) r -= weights[i++];
      hat.setAttribute("fill", colours[i]);
    });
  }

  // Shrink shirt numbers that are too wide for the torso (fine up to about five digits)
  function fitNumber(text) {
    text.style.fontSize = "";
    const width = text.getComputedTextLength();
    if (width > 30) text.style.fontSize = `${(14 * 30) / width}px`;
  }

  document.querySelectorAll(".hats-number").forEach(fitNumber);

  // Endless queue, drawn as you scroll; prisoner n's hat is a seeded 50/50 coin
  const X0 = 44;
  const DX = 61;

  function hash(n, seed) {
    let h = Math.imul(n ^ seed, 0x9e3779b1);
    h ^= h >>> 15;
    h = Math.imul(h, 0x85ebca6b);
    h ^= h >>> 13;
    return h >>> 0;
  }

  const hatIsBlack = (n, seed) => hash(n, seed) >= 2 ** 31;
  const hatHue = (n, seed) => `hsl(${((hash(n, seed) / 2 ** 32) * 360).toFixed(1)}, 65%, 62%)`;

  // Small marks under prisoner n: the special arrangement's colour, and a tick or cross for whether he matches it
  function marker(n, black, special) {
    const x = X0 + (n - 1) * DX;
    const mark = black === special
      ? `<path d="M${x + 3} 170 l4 4 l8 -9" stroke="#40a02b"/>`
      : `<path d="M${x + 4} 165 l9 9 m0 -9 l-9 9" stroke="#c70b34"/>`;
    return `<circle cx="${x - 9}" cy="170" r="6" fill="${special ? BLACK : WHITE}" stroke="#4c4f69" stroke-width="1.5"/>
      <g fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">${mark}</g>`;
  }

  // Dashed line just after prisoner n, where the random hats stop
  function boundary(n) {
    const x = X0 + (n - 0.5) * DX;
    return `<g fill="#c70b34" opacity="0.7">
      <line x1="${x}" y1="4" x2="${x}" y2="180" stroke="#c70b34" stroke-width="1.5" stroke-dasharray="5 5"/>
      <text x="${x + 8}" y="14" font-size="12">After this point, the colours alternate.</text>
    </g>`;
  }

  function prisoner(n, fill, marks) {
    const x = X0 + (n - 1) * DX;
    return `<g>
      <path d="M${x - 19} 146 v-30 q0 -20 19 -20 q19 0 19 20 v30 z" fill="#8c8fa1"/>
      <text class="hats-number" x="${x}" y="129" text-anchor="middle" font-size="14" font-weight="bold" fill="#f7f7f7">${n}</text>
      <rect x="${x - 5}" y="82" width="10" height="16" fill="#bcc0cc"/>
      <circle cx="${x}" cy="72" r="14" fill="#bcc0cc"/>
      <path d="M${x + 13} 68 l6 6 l-6 1 z" fill="#bcc0cc"/>
      <circle cx="${x + 7}" cy="69" r="1.6" fill="#4c4f69"/>
      <path class="hat" d="M${x - 14} 64 L${x - 1.5} 27 Q${x} 24 ${x + 1.5} 27 L${x + 14} 64 Q${x} 59 ${x - 14} 64 z"
        fill="${fill}" stroke="#4c4f69" stroke-width="1.5" stroke-linejoin="round"/>
      ${marks}
    </g>`;
  }

  document.querySelectorAll(".hats-infinite-figure").forEach((figure) => {
    const scroller = figure.querySelector(".hats-infinite");
    const svg = scroller.querySelector("svg");
    const ground = svg.querySelector(".hats-ground");
    const height = svg.getAttribute("height");
    let seed = Number(figure.dataset.seed ?? 1089);
    let count = 0;

    // With data-random-until, hats after that point alternate black/white, and the marks compare them to pure alternation
    const randomUntil = Number(figure.dataset.randomUntil ?? Infinity);
    const special = (n) => (randomUntil === Infinity ? undefined : n % 2 === 1);
    const black = (n) => (n <= randomUntil ? hatIsBlack(n, seed) : special(n));
    const marks = (n) => (special(n) === undefined ? "" : marker(n, black(n), special(n)));

    // With data-hues, every hat is a seeded uniform hue instead
    const hues = figure.dataset.hues !== undefined;
    const fill = (n) => (hues ? hatHue(n, seed) : black(n) ? BLACK : WHITE);

    // Keep a screenful of prisoners beyond the visible edge
    function extend() {
      const target = scroller.scrollLeft + 2 * scroller.clientWidth;
      if (X0 + count * DX >= target) return;
      while (X0 + count * DX < target) {
        count++;
        svg.insertAdjacentHTML("beforeend", prisoner(count, fill(count), marks(count)));
        fitNumber(svg.lastElementChild.querySelector(".hats-number"));
        if (count === randomUntil) svg.insertAdjacentHTML("beforeend", boundary(count));
      }
      const width = X0 + count * DX;
      svg.setAttribute("width", width);
      svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
      ground.setAttribute("width", width - 10);
    }

    // New seed, then redraw everyone up to where we've scrolled
    function reroll() {
      seed = Math.floor(Math.random() * 2 ** 32);
      svg.querySelectorAll(":scope > g").forEach((g) => g.remove());
      count = 0;
      extend();
    }

    // Grow the left fade over the first 80px of scrolling, so #1 slides out under it
    function fadeLeft() {
      scroller.style.setProperty("--fade-left", `${Math.min(scroller.scrollLeft, 80)}px`);
    }

    extend();
    scroller.addEventListener("scroll", extend, { passive: true });
    scroller.addEventListener("scroll", fadeLeft, { passive: true });
    figure.querySelector(".hats-shuffle")?.addEventListener("click", reroll);
    // Drawn while hidden behind a gate it has zero width, so fill it in once revealed
    document.addEventListener("gate:reveal", (event) => event.target.contains(figure) && extend());
  });

  // A prisoner at every real time, seeing only the past. The band is the hats; drag to move him.
  const BAND_L = 20;
  const BAND_R = 620;

  // Smooth stretches with a couple of jumps; u runs from 0 to 1 along the band
  function pastHue(u) {
    let h = 20 + 420 * u + 50 * Math.sin(17 * u + 2) + 25 * Math.sin(41 * u);
    if (u > 0.38) h += 120;
    if (u > 0.71) h -= 90;
    return ((h % 360) + 360) % 360;
  }

  const pastColour = (x) => `hsl(${pastHue((x - BAND_L) / (BAND_R - BAND_L)).toFixed(0)}, 65%, 62%)`;

  document.querySelectorAll(".hats-past svg").forEach((svg) => {
    const stops = [];
    for (let k = 0; k <= 120; k++) {
      const x = BAND_L + (k / 120) * (BAND_R - BAND_L);
      stops.push(`<stop offset="${k / 120}" stop-color="${pastColour(x)}"/>`);
    }
    svg.innerHTML = `
      <defs><linearGradient id="hats-past-band">${stops.join("")}</linearGradient></defs>
      <rect x="${BAND_L}" y="150" width="${BAND_R - BAND_L}" height="26" rx="4" fill="url(#hats-past-band)"/>
      <rect class="past-hidden" y="146" height="34" fill="#f8f7f4" opacity="0.9"/>
      <text class="past-hidden-label" y="167" text-anchor="middle" font-size="12" fill="#8c8fa1">can't see</text>
      <line x1="${BAND_L}" y1="186" x2="${BAND_R}" y2="186" stroke="#4c4f69" stroke-width="1.5"/>
      <text x="${BAND_L}" y="202" font-size="12" fill="#6c6f85">past</text>
      <text x="${BAND_R}" y="202" text-anchor="end" font-size="12" fill="#6c6f85">future</text>
      <g class="past-prisoner">
        <line x1="0" y1="182" x2="0" y2="190" stroke="#4c4f69" stroke-width="1.5"/>
        <text x="0" y="202" text-anchor="middle" font-size="13" font-style="italic" fill="#4c4f69">t</text>
        <g transform="scale(-1, 1)">
          <path d="M-19 146 v-30 q0 -20 19 -20 q19 0 19 20 v30 z" fill="#8c8fa1"/>
          <rect x="-5" y="82" width="10" height="16" fill="#bcc0cc"/>
          <circle cx="0" cy="72" r="14" fill="#bcc0cc"/>
          <path d="M13 68 l6 6 l-6 1 z" fill="#bcc0cc"/>
          <circle cx="7" cy="69" r="1.6" fill="#4c4f69"/>
          <path class="past-hat" d="M-14 64 L-1.5 27 Q0 24 1.5 27 L14 64 Q0 59 -14 64 z" stroke="#4c4f69" stroke-width="1.5" stroke-linejoin="round"/>
        </g>
        <text x="0" y="129" text-anchor="middle" font-size="14" font-weight="bold" font-style="italic" fill="#f7f7f7">t</text>
        <path d="M-124 34 H-40 Q-32 34 -32 42 V60 Q-32 68 -40 68 H-38 L-24 74 L-50 68 H-116 Q-124 68 -124 60 V42 Q-124 34 -116 34 z"
          fill="#ffffff" stroke="#4c4f69" stroke-width="1.5" stroke-linejoin="round"/>
        <text x="-114" y="56" font-size="12" fill="#4c4f69">I guess</text>
        <circle class="past-guess" cx="-46" cy="51" r="8" stroke="#4c4f69" stroke-width="1.5"/>
      </g>`;

    const prisoner = svg.querySelector(".past-prisoner");
    const hidden = svg.querySelector(".past-hidden");
    const hiddenLabel = svg.querySelector(".past-hidden-label");

    // He's almost surely right, so his guess shows his true hat colour
    function place(t) {
      t = Math.min(Math.max(t, 140), BAND_R - 10);
      prisoner.setAttribute("transform", `translate(${t}, 0)`);
      prisoner.querySelector(".past-hat").setAttribute("fill", pastColour(t));
      prisoner.querySelector(".past-guess").setAttribute("fill", pastColour(t));
      hidden.setAttribute("x", t);
      hidden.setAttribute("width", BAND_R + 2 - t);
      hiddenLabel.setAttribute("x", (t + BAND_R) / 2);
      hiddenLabel.style.display = BAND_R - t > 70 ? "" : "none";
    }

    function drag(event) {
      const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(svg.getScreenCTM().inverse());
      place(point.x);
    }

    svg.addEventListener("pointerdown", (event) => {
      svg.setPointerCapture(event.pointerId);
      drag(event);
    });
    svg.addEventListener("pointermove", (event) => {
      if (svg.hasPointerCapture(event.pointerId)) drag(event);
    });
    place(360);
  });

  // N prisoners in a circle seen from above, with N colours of hat; +/- changes N
  const CIRCLE_MIN = 2;
  const CIRCLE_MAX = 12;
  const circleColour = (i, n) => `hsl(${(10 + (360 * i) / n).toFixed(0)}, 65%, 62%)`;

  // Seen from above, facing up: shoulders, head, nose, and the cone hat from its tip
  function topDownPrisoner(x, y, angle, scale, fill, label) {
    return `<g transform="translate(${x} ${y}) rotate(${angle - 90}) scale(${scale})">
        <ellipse cx="0" cy="9" rx="25" ry="12" fill="#8c8fa1"/>
        <path d="M-4 -11 L0 -19 L4 -11 z" fill="#bcc0cc"/>
        <circle r="13" fill="#bcc0cc"/>
        <circle r="9.5" fill="${fill}" stroke="#4c4f69" stroke-width="1.2"/>
        <circle r="1.8" fill="#4c4f69"/>
      </g>${label}`;
  }

  // Same lopsided draw as the four-colour queue: weights ~ Dirichlet(1, ..., 1) over n colours
  function dirichletHats(n, count = n) {
    const weights = Array.from({ length: n }, () => -Math.log(1 - Math.random()));
    const total = weights.reduce((a, b) => a + b);
    return Array.from({ length: count }, () => {
      let r = Math.random() * total;
      let i = 0;
      while (i < n - 1 && r > weights[i]) r -= weights[i++];
      return i;
    });
  }

  document.querySelectorAll(".hats-circle").forEach((figure) => {
    const svg = figure.querySelector("svg");
    let n = Number(figure.dataset.people);
    let hats = figure.dataset.hats.split(",").map(Number);

    let selected = null;

    // Prisoner i bets the total is i mod n, so guesses whatever makes that true
    function thoughts(i) {
      const others = hats.filter((_, j) => j !== i);
      const sum = others.reduce((a, b) => a + b, 0) % n;
      const guess = (((i - sum) % n) + n) % n;
      const terms = others.map((hat, k) => (k < others.length - 1 ? `${hat} +` : `${hat} = ${sum} mod ${n}`));
      const half = others.length > 6 ? Math.ceil(others.length / 2) : others.length;
      const lines = [
        `The sum of the other ${n - 1} ${n === 2 ? "hat" : "hats"} is`,
        terms.slice(0, half).join(" "),
        ...(half < others.length ? [terms.slice(half).join(" ")] : []),
        `but I should guess the total is ${i} mod ${n}.`,
        `So I need to guess ${guess}.`,
      ];
      return { lines, guess };
    }

    function bubble(person, cy) {
      const [x1, x2] = [356, 630];
      if (!person) {
        return `<text x="${(x1 + x2) / 2}" y="${cy + 4}" text-anchor="middle" font-size="12" fill="#8c8fa1">Click a prisoner to see what they think.</text>`;
      }
      const { lines, guess } = thoughts(person.i);
      const height = lines.length * 19 + 22;
      const y1 = cy - height / 2;
      const right = guess === hats[person.i];
      const mark = right
        ? `<path d="M${x2 - 30} ${y1 + height - 20} l4 4 l8 -9" stroke="#40a02b"/>`
        : `<path d="M${x2 - 29} ${y1 + height - 24} l9 9 m0 -9 l-9 9" stroke="#c70b34"/>`;
      // A short trail of dots from the bubble towards whoever is thinking
      const [dx, dy] = [person.x - x1, person.y - cy];
      const far = Math.hypot(dx, dy) > 120; // too close and the dots crowd his label; the ring is enough
      const trail = (far ? [[0.05, 5], [0.1, 3.5], [0.15, 2.5]] : [])
        .map(([f, size]) => `<circle cx="${x1 + dx * f}" cy="${cy + dy * f}" r="${size}" fill="#ffffff" stroke="#4c4f69" stroke-width="1.5"/>`);
      const text = lines.map((line, k) => `<text x="${x1 + 18}" y="${y1 + 26 + k * 19}" font-size="12" fill="#4c4f69">${line}</text>`);
      return `${trail.join("")}
        <rect x="${x1}" y="${y1}" width="${x2 - x1}" height="${height}" rx="18" fill="#ffffff" stroke="#4c4f69" stroke-width="1.5"/>
        ${text.join("")}
        <circle cx="${x2 - 48}" cy="${y1 + height - 20}" r="7" fill="${circleColour(guess, n)}" stroke="#4c4f69" stroke-width="1.5"/>
        <g fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">${mark}</g>`;
    }

    function draw() {
      const [cx, cy, r] = [180, 142, 96];
      const scale = Math.min(1.25, (2 * Math.PI * r) / n / 62); // shrink so shoulders don't touch
      const spots = hats.map((hat, i) => {
        const rad = ((-90 + (360 * i) / n) * Math.PI) / 180;
        return { i, hat, rad, x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
      });
      const people = spots.map(({ i, hat, rad, x, y }) => {
        const label = `<text x="${cx + (r + 40) * Math.cos(rad)}" y="${cy + (r + 40) * Math.sin(rad) + 4}"
          text-anchor="middle" font-size="12" fill="#8c8fa1">${i}</text>`;
        const ring = i === selected ? `<circle cx="${x}" cy="${y}" r="${30 * scale}" fill="none" stroke="#ed8936" stroke-width="2"/>` : "";
        return `<g class="circle-person" data-index="${i}" tabindex="0" role="button" aria-label="Show prisoner ${i}'s reasoning">
          <circle cx="${x}" cy="${y}" r="${30 * scale}" fill="transparent"/>${ring}
          ${topDownPrisoner(x, y, (rad * 180) / Math.PI, scale, circleColour(hat, n), label)}</g>`;
      });
      const key = Array.from({ length: n }, (_, i) => {
        const x = cx + (i - (n - 1) / 2) * 30;
        return `<circle cx="${x}" cy="300" r="8" fill="${circleColour(i, n)}" stroke="#4c4f69" stroke-width="1.5"/>
          <text x="${x}" y="324" text-anchor="middle" font-size="11" fill="#6c6f85">${i}</text>`;
      });
      svg.innerHTML = people.join("") + key.join("") + bubble(spots[selected], cy);
      figure.querySelector(".hats-count").textContent = n;
      figure.querySelectorAll(".hats-step").forEach((button) => {
        const next = n + Number(button.dataset.step);
        button.disabled = next < CIRCLE_MIN || next > CIRCLE_MAX;
      });
    }

    // Click (or Enter) on a prisoner to show their reasoning
    function select(event) {
      const person = event.target.closest(".circle-person");
      if (!person || (event.type === "keydown" && event.key !== "Enter" && event.key !== " ")) return;
      event.preventDefault();
      const index = Number(person.dataset.index);
      selected = selected === index ? null : index; // clicking the thinker again hides the bubble
      draw();
      svg.querySelector(`.circle-person[data-index="${index}"]`).focus();
    }

    svg.addEventListener("click", select);
    svg.addEventListener("keydown", select);

    figure.querySelectorAll(".hats-step").forEach((button) => {
      button.addEventListener("click", () => {
        n = Math.min(Math.max(n + Number(button.dataset.step), CIRCLE_MIN), CIRCLE_MAX);
        hats = dirichletHats(n);
        if (selected >= n) selected = null;
        draw();
      });
    });
    figure.querySelector(".hats-shuffle").addEventListener("click", () => {
      hats = dirichletHats(n);
      draw();
    });
    draw();
  });

  // The pillar strategy, mod 3: [seen, seen, rule as text, guess from the seen hats]
  const SUB = "₀₁₂₃";
  const PILLAR_RULES = [
    [1, 3, `h${SUB[1]} + h${SUB[3]}`, (a, b) => [`${a} + ${b}`, a + b]],
    [0, 2, `h${SUB[2]} − h${SUB[0]}`, (a, b) => [`${b} − ${a}`, b - a]],
    [1, 3, `h${SUB[3]} − h${SUB[1]}`, (a, b) => [`${b} − ${a}`, b - a]],
    [0, 2, `−(h${SUB[0]} + h${SUB[2]})`, (a, b) => [`−(${a} + ${b})`, -(a + b)]],
  ];

  function pillarGuess(i, hats) {
    const [p, q, rule, apply] = PILLAR_RULES[i];
    const [sum, value] = apply(hats[p], hats[q]);
    return { p, q, rule, sum, guess: ((value % 3) + 3) % 3 };
  }

  // Four prisoners around a pillar: each sees their two neighbours, but not the one opposite.
  // With data-thoughts, clicking also shows their reasoning, and every prisoner gets a tick or cross.
  // All pillar diagrams share one set of hats, so either shuffle button rerolls both.
  const pillarUpdates = [];

  document.querySelectorAll(".hats-pillar").forEach((figure) => {
    const svg = figure.querySelector("svg");
    const k = Number(figure.dataset.k);
    let hats = figure.dataset.hats.split(",").map(Number);
    let selected = null;
    const thinking = figure.dataset.thoughts !== undefined;
    const [cx, cy, r] = [thinking ? 190 : 280, 150, 100];
    const spot = (i) => {
      const rad = ((-90 + 90 * i) * Math.PI) / 180;
      return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad), rad };
    };

    // Dashed line from i towards j; a blocked one stops at the pillar with a cross
    function sight(i, j, blocked) {
      const [a, b] = [spot(i), spot(j)];
      const length = Math.hypot(b.x - a.x, b.y - a.y);
      const [ux, uy] = [(b.x - a.x) / length, (b.y - a.y) / length];
      const end = blocked ? r - 48 : length - 30;
      const line = `<line x1="${a.x + ux * 30}" y1="${a.y + uy * 30}" x2="${a.x + ux * end}" y2="${a.y + uy * end}"
        stroke="${blocked ? "#c70b34" : "#ed8936"}" stroke-width="2" stroke-dasharray="5 4"/>`;
      if (!blocked) return line;
      const [x, y] = [a.x + ux * (end + 8), a.y + uy * (end + 8)];
      return `${line}<path d="M${x - 5} ${y - 5} l10 10 m0 -10 l-10 10" stroke="#c70b34" stroke-width="2.5" stroke-linecap="round"/>`;
    }

    // Tick or cross beside each prisoner's number
    function marks() {
      return hats.map((hat, i) => {
        const { rad } = spot(i);
        const side = Math.cos(rad) < -0.5 ? -14 : 14; // outward, clear of the ring
        const [x, y] = [cx + (r + 40) * Math.cos(rad) + side, cy + (r + 40) * Math.sin(rad)];
        const mark = pillarGuess(i, hats).guess === hat
          ? `<path d="M${x - 3} ${y} l3 3 l6 -7" stroke="#40a02b"/>`
          : `<path d="M${x - 3} ${y - 4} l7 7 m0 -7 l-7 7" stroke="#c70b34"/>`;
        return `<g fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${mark}</g>`;
      }).join("");
    }

    function bubble() {
      if (selected === null) return "";
      const { p, q, rule, sum, guess } = pillarGuess(selected, hats);
      const lines = [
        `I see h${SUB[p]} = ${hats[p]} and h${SUB[q]} = ${hats[q]},`,
        `so I guess ${rule}`,
        `= ${sum} = ${guess} (mod 3).`,
      ];
      const [x1, x2, height] = [390, 630, lines.length * 19 + 22];
      const y1 = cy - height / 2;
      const right = guess === hats[selected];
      const mark = right
        ? `<path d="M${x2 - 30} ${y1 + height - 20} l4 4 l8 -9" stroke="#40a02b"/>`
        : `<path d="M${x2 - 29} ${y1 + height - 24} l9 9 m0 -9 l-9 9" stroke="#c70b34"/>`;
      const text = lines.map((line, n) => `<text x="${x1 + 18}" y="${y1 + 26 + n * 19}" font-size="12" fill="#4c4f69">${line}</text>`);
      return `<rect x="${x1}" y="${y1}" width="${x2 - x1}" height="${height}" rx="18" fill="#ffffff" stroke="#4c4f69" stroke-width="1.5"/>
        ${text.join("")}
        <circle cx="${x2 - 48}" cy="${y1 + height - 20}" r="7" fill="${circleColour(guess, k)}" stroke="#4c4f69" stroke-width="1.5"/>
        <g fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">${mark}</g>`;
    }

    function draw() {
      const opposite = selected === null ? null : (selected + 2) % 4;
      const people = hats.map((hat, i) => {
        const { x, y, rad } = spot(i);
        const label = `<text x="${cx + (r + 40) * Math.cos(rad)}" y="${cy + (r + 40) * Math.sin(rad) + 4}"
          text-anchor="middle" font-size="12" fill="#8c8fa1">${i}</text>`;
        const ring = i === selected ? `<circle cx="${x}" cy="${y}" r="38" fill="none" stroke="#ed8936" stroke-width="2"/>` : "";
        return `<g class="circle-person" data-index="${i}" tabindex="0" role="button" aria-label="Show who prisoner ${i} can see"
          opacity="${i === opposite ? 0.35 : 1}">
          <circle cx="${x}" cy="${y}" r="38" fill="transparent"/>${ring}
          ${topDownPrisoner(x, y, (rad * 180) / Math.PI, 1.25, circleColour(hat, k), label)}</g>`;
      });
      const lines = selected === null ? "" :
        sight(selected, (selected + 1) % 4, false) + sight(selected, (selected + 3) % 4, false) + sight(selected, opposite, true);
      const [kx, ky] = thinking ? [24, 36] : [500, 120];
      const key = Array.from({ length: k }, (_, i) => `
        <circle cx="${kx}" cy="${ky + i * 30}" r="8" fill="${circleColour(i, k)}" stroke="#4c4f69" stroke-width="1.5"/>
        <text x="${kx + 18}" y="${ky + 4 + i * 30}" font-size="11" fill="#6c6f85">${i}</text>`);
      const caption = selected === null
        ? (thinking ? "Click a prisoner to see their reasoning." : "Click a prisoner to see who they can see.")
        : (thinking ? "" : `Prisoner ${selected} sees ${(selected + 3) % 4} and ${(selected + 1) % 4}, but not ${opposite}.`);
      const extras = thinking ? marks() + bubble() : "";
      svg.innerHTML = `
        <defs><pattern id="hats-pillar-hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="8" stroke="#bcc0cc" stroke-width="3"/></pattern></defs>
        <rect x="${cx - 32}" y="${cy - 32}" width="64" height="64" rx="6" fill="#dce0e8"/>
        <rect x="${cx - 32}" y="${cy - 32}" width="64" height="64" rx="6" fill="url(#hats-pillar-hatch)" stroke="#9ca0b0" stroke-width="1.5"/>
        ${lines}${people.join("")}${key.join("")}${extras}
        <text x="${thinking ? 510 : cx}" y="${thinking ? cy + 4 : 316}" text-anchor="middle" font-size="12" fill="#8c8fa1">${caption}</text>`;
    }

    // Click (or Enter) on a prisoner to show their view; again to hide it
    function select(event) {
      const person = event.target.closest(".circle-person");
      if (!person || (event.type === "keydown" && event.key !== "Enter" && event.key !== " ")) return;
      event.preventDefault();
      const index = Number(person.dataset.index);
      selected = selected === index ? null : index;
      draw();
      svg.querySelector(`.circle-person[data-index="${index}"]`).focus();
    }

    svg.addEventListener("click", select);
    svg.addEventListener("keydown", select);
    pillarUpdates.push((next) => {
      hats = next;
      draw();
    });
    figure.querySelector(".hats-shuffle").addEventListener("click", () => {
      const next = dirichletHats(k, 4);
      pillarUpdates.forEach((update) => update(next));
    });
    draw();
  });

  // Ebert's game: three prisoners in a triangle, fair black/white hats
  document.querySelectorAll(".hats-ebert").forEach((figure) => {
    const svg = figure.querySelector("svg");
    let hats = figure.dataset.hats.split(",").map(Number);
    const [cx, cy, r] = [320, 108, 54];

    function draw() {
      svg.innerHTML = hats.map((black, i) => {
        const rad = ((-90 + 120 * i) * Math.PI) / 180;
        const label = `<text x="${cx + (r + 36) * Math.cos(rad)}" y="${cy + (r + 36) * Math.sin(rad) + 4}"
          text-anchor="middle" font-size="12" fill="#8c8fa1">${i + 1}</text>`;
        return topDownPrisoner(cx + r * Math.cos(rad), cy + r * Math.sin(rad), (rad * 180) / Math.PI, 1.25, black ? BLACK : WHITE, label);
      }).join("");
    }

    figure.querySelector(".hats-shuffle").addEventListener("click", () => {
      hats = hats.map(() => (Math.random() < 0.5 ? 1 : 0));
      draw();
    });
    draw();
  });

  // Ebert's game with repeated rounds: a decision tree whose leaves are the eight worlds.
  // Hats are [h0, h1, h2] with 1 = black, shown as prisoners 1, 2, 3. Round 1: prisoner 1 guesses black
  // if he sees two whites. Round 2: prisoner 2 guesses black if he sees white on 3. Round 3: prisoner 3 guesses black.
  const endRound = ([, h1, h2]) => (!h1 && !h2 ? 1 : !h2 ? 2 : 3);
  const guesser = (round) => round - 1;

  // Tree nodes: [id, round, text, x, y]; leaves hang off the three guess nodes
  const TREE = [
    ["q1", 1, "Round 1: does 1 see two whites?", 240, 26],
    ["a1", 1, "1 guesses black", 80, 92],
    ["q2", 2, "Round 2: does 2 see white on 3?", 400, 92],
    ["a2", 2, "2 guesses black", 240, 158],
    ["a3", 3, "Round 3: 3 guesses black", 480, 158],
  ];
  const EDGES = [["q1", "a1", "yes"], ["q1", "q2", "no"], ["q2", "a2", "yes"], ["q2", "a3", "no"]];
  const LEAVES = [[1, 0, 0], [0, 0, 0], [0, 1, 0], [1, 1, 0], [0, 0, 1], [1, 0, 1], [0, 1, 1], [1, 1, 1]];
  const pathTo = (world) => ({ 1: ["q1", "a1"], 2: ["q1", "q2", "a2"], 3: ["q1", "q2", "a3"] })[endRound(world)];

  document.querySelectorAll(".hats-rounds").forEach((figure) => {
    const tree = figure.querySelector(".hats-rounds-tree");
    const player = figure.querySelector(".hats-rounds-player");
    const stage = player.querySelector("svg");
    const node = (id) => TREE.find((n) => n[0] === id);
    let selected = null;
    let round = 1;

    // Nodes reached so far in the selected world light up
    function lit(id) {
      if (selected === null) return false;
      return pathTo(LEAVES[selected]).includes(id) && node(id)[1] <= round;
    }

    function drawTree() {
      const edges = EDGES.map(([from, to, label]) => {
        const [a, b] = [node(from), node(to)];
        const on = lit(from) && lit(to);
        const [mx, my] = [(a[3] + b[3]) / 2, (a[4] + b[4]) / 2];
        return `<line x1="${a[3]}" y1="${a[4] + 13}" x2="${b[3]}" y2="${b[4] - 13}" stroke="${on ? "#ed8936" : "#bcc0cc"}" stroke-width="${on ? 2.5 : 1.5}"/>
          <text x="${mx + (b[3] < a[3] ? -18 : 18)}" y="${my}" text-anchor="middle" font-size="11" fill="#8c8fa1">${label}</text>`;
      });
      const leafEdges = LEAVES.map((world, k) => {
        const parent = node(pathTo(world).at(-1));
        const on = selected === k && round === endRound(world);
        return `<line x1="${parent[3]}" y1="${parent[4] + 13}" x2="${40 + 80 * k}" y2="208" stroke="${on ? "#ed8936" : "#bcc0cc"}" stroke-width="${on ? 2.5 : 1.5}"/>`;
      });
      const nodes = TREE.map(([id, , text, x, y]) => {
        const width = text.length * 6.4 + 20;
        return `<rect x="${x - width / 2}" y="${y - 13}" width="${width}" height="26" rx="13" fill="#ffffff"
            stroke="${lit(id) ? "#ed8936" : "#4c4f69"}" stroke-width="${lit(id) ? 2.5 : 1.5}"/>
          <text x="${x}" y="${y + 4}" text-anchor="middle" font-size="12" fill="#4c4f69">${text}</text>`;
      });
      const leaves = LEAVES.map((world, k) => {
        const x = 40 + 80 * k;
        const win = !(world[0] === 0 && world[1] === 0 && world[2] === 0);
        const swatches = [[0, -9], [9, 6], [-9, 6]].map(([dx, dy], i) =>
          `<circle cx="${x + dx}" cy="${232 + dy}" r="6.5" fill="${world[i] ? BLACK : WHITE}" stroke="#4c4f69" stroke-width="1.3"/>`);
        return `<g class="rounds-leaf" data-index="${k}" tabindex="0" role="button" aria-label="Play out world ${k + 1}">
          <rect x="${x - 30}" y="${210}" width="60" height="44" rx="8" fill="${win ? "#eef6ec" : "#fbedee"}"
            stroke="${selected === k ? "#ed8936" : "none"}" stroke-width="2.5"/>${swatches.join("")}</g>`;
      });
      tree.innerHTML = edges.join("") + leafEdges.join("") + nodes.join("") + leaves.join("");
    }

    // The chosen world at the current round: who passes, who guesses, and how it ends
    function drawStage() {
      const world = LEAVES[selected];
      const last = endRound(world);
      const g = guesser(round);
      const guessing = round === last;
      const [cx, cy, r] = [190, 112, 54];
      const spots = [-90, 30, 150].map((deg) => (deg * Math.PI) / 180);
      const people = world.map((black, i) => {
        const rad = spots[i];
        const [x, y] = [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
        const label = `<text x="${cx + (r + 36) * Math.cos(rad)}" y="${cy + (r + 36) * Math.sin(rad) + 4}"
          text-anchor="middle" font-size="12" fill="#8c8fa1">${i + 1}</text>`;
        const says = guessing && i === g ? "Black!" : "Pass";
        const [bx, by] = [[x + 30, y - 34], [x + 34, y - 4], [x - 104, y - 4]][i];
        const bubble = `<rect x="${bx}" y="${by - 15}" width="70" height="26" rx="13" fill="#ffffff" stroke="#4c4f69" stroke-width="1.5"/>
          <text x="${bx + 35}" y="${by + 3}" text-anchor="middle" font-size="12" font-weight="${says === "Pass" ? "normal" : "bold"}"
            fill="${says === "Pass" ? "#8c8fa1" : "#4c4f69"}">${says}</text>`;
        return topDownPrisoner(x, y, (rad * 180) / Math.PI, 1.25, black ? BLACK : WHITE, label) + bubble;
      });
      const right = world[g] === 1;
      const status = !guessing
        ? ["Everyone passes,", "so there's another round."]
        : [`Prisoner ${g + 1} guesses black:`, right ? "right, so the team wins!" : "wrong, so the team loses."];
      const colour = !guessing ? "#4c4f69" : right ? "#40a02b" : "#c70b34";
      stage.innerHTML = people.join("") + `
        <text x="420" y="86" font-size="14" font-weight="bold" fill="#4c4f69">Round ${round}</text>
        <text x="420" y="112" font-size="12" fill="${colour}">${status[0]}</text>
        <text x="420" y="130" font-size="12" fill="${colour}">${status[1]}</text>`;
      const [back, next] = player.querySelectorAll(".hats-round-button");
      back.disabled = round === 1;
      next.disabled = round === last;
    }

    function draw() {
      drawTree();
      player.hidden = selected === null;
      if (selected !== null) drawStage();
    }

    // Click (or Enter) on a world to play it from round 1; again to close it
    function choose(event) {
      const leaf = event.target.closest(".rounds-leaf");
      if (!leaf || (event.type === "keydown" && event.key !== "Enter" && event.key !== " ")) return;
      event.preventDefault();
      const k = Number(leaf.dataset.index);
      selected = selected === k ? null : k;
      round = 1;
      draw();
      tree.querySelector(`.rounds-leaf[data-index="${k}"]`).focus();
    }

    tree.addEventListener("click", choose);
    tree.addEventListener("keydown", choose);
    player.querySelectorAll(".hats-round-button").forEach((button) => {
      button.addEventListener("click", () => {
        round += Number(button.dataset.step);
        draw();
      });
    });
    draw();
  });

  // Two prisoners with two stacked hats each: every hat is a fair coin
  document.querySelectorAll(".hats-pair").forEach((figure) => {
    figure.querySelector(".hats-shuffle").addEventListener("click", () => {
      figure.querySelectorAll(".hat").forEach((hat) => hat.setAttribute("fill", Math.random() < 0.5 ? BLACK : WHITE));
    });
  });

  // Levine's problem: two prisoners with endless stacks of hats, drawn upwards as you scroll.
  // Coordinates match the two-hat diagram (ground at 146–152, first hat's brim at 64); hat k's brim
  // sits 14 higher than hat k-1's. The svg grows upwards, so everything is drawn inside a shifted group.
  const STACK_STEP = 14;
  const STACK_X = [260, 380];
  const STACK_NAMED = [5, 9]; // the example in the prose: left names hat 5, right names hat 9

  function stackPrisoner(x, n, mirror) {
    const body = `<path d="M${x - 19} 146 v-30 q0 -20 19 -20 q19 0 19 20 v30 z" fill="#8c8fa1"/>
      <rect x="${x - 5}" y="82" width="10" height="16" fill="#bcc0cc"/>
      <circle cx="${x}" cy="72" r="14" fill="#bcc0cc"/>
      <path d="M${x + 13} 68 l6 6 l-6 1 z" fill="#bcc0cc"/>
      <circle cx="${x + 7}" cy="69" r="1.6" fill="#4c4f69"/>`;
    const facing = mirror ? `<g transform="translate(${2 * x} 0) scale(-1 1)">${body}</g>` : body;
    return `${facing}<text class="hats-number" x="${x}" y="129" text-anchor="middle" font-size="14" font-weight="bold" fill="#f7f7f7">${n}</text>`;
  }

  // Small orange arrow just outside a named hat's number, pointing in at the stack
  function stackArrow(x, y, side) {
    return `<path d="M${x + side * 14} ${y} H${x} m${-side * -4} -4 l${-side * 4} 4 l${-side * -4} 4"
      fill="none" stroke="#ed8936" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`;
  }

  // Hat k (from 1) on prisoner p, with a small grey number on the outside
  function stackHat(p, k, black) {
    const x = STACK_X[p];
    const base = 64 - STACK_STEP * (k - 1);
    const side = p === 0 ? -1 : 1;
    const named = STACK_NAMED[p] === k;
    return `<path d="M${x - 14} ${base} L${x - 1.5} ${base - 37} Q${x} ${base - 40} ${x + 1.5} ${base - 37} L${x + 14} ${base} Q${x} ${base - 5} ${x - 14} ${base} z"
        fill="${black ? BLACK : WHITE}" stroke="#4c4f69" stroke-width="1.5" stroke-linejoin="round"${named ? ' filter="url(#hats-stack-glow)"' : ""}/>
      <text x="${x + side * 21}" y="${base - 3}" text-anchor="${p === 0 ? "end" : "start"}" font-size="9"
        ${named ? 'font-weight="bold" fill="#ed8936"' : 'fill="#9ca0b0"'}>${k}</text>
      ${named ? stackArrow(x + side * 31, base - 6, side) : ""}`;
  }

  document.querySelectorAll(".hats-stacks").forEach((figure) => {
    const scroller = figure.querySelector(".hats-stacks-scroll");
    const svg = scroller.querySelector("svg");
    let seed = 1089;
    let count = 0;

    svg.innerHTML = `<defs><filter id="hats-stack-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="0" stdDeviation="3" flood-color="#ed8936" flood-opacity="0.9"/></filter></defs>
      <g class="stack-world"><rect x="200" y="146" width="240" height="6" rx="3" fill="#ccd0da"/>
      ${stackPrisoner(STACK_X[0], 1, false)}${stackPrisoner(STACK_X[1], 2, true)}<g class="stack-hats"></g></g>`;
    const world = svg.querySelector(".stack-world");
    const hats = svg.querySelector(".stack-hats");

    // Hats alternate between the prisoners in the hash, so the two stacks are independent
    function addHats(n) {
      const before = svg.getBoundingClientRect().height;
      let markup = "";
      for (let k = count + 1; k <= count + n; k++) {
        markup += stackHat(0, k, hatIsBlack(2 * k, seed)) + stackHat(1, k, hatIsBlack(2 * k + 1, seed));
      }
      hats.insertAdjacentHTML("beforeend", markup);
      count += n;
      // Show from just above the top hat's tip down to 3 below the ground
      const top = 64 - STACK_STEP * (count - 1) - 44;
      svg.setAttribute("viewBox", `0 0 640 ${155 - top}`);
      world.setAttribute("transform", `translate(0 ${-top})`);
      scroller.scrollTop += svg.getBoundingClientRect().height - before; // keep the view still
    }

    // Keep a few screens of hats above the current view
    function extend() {
      while (scroller.scrollTop < 2 * scroller.clientHeight) addHats(40);
    }

    // Grow the bottom fade over the first 80px of scrolling up, so the ground slides out under it
    function fadeBottom() {
      const fromBottom = scroller.scrollHeight - scroller.clientHeight - scroller.scrollTop;
      scroller.style.setProperty("--fade-bottom", `${Math.min(Math.max(fromBottom, 0), 80)}px`);
    }

    // Keep the example sentence under the diagram in step with the named hats
    function describe() {
      const [left, right] = STACK_NAMED.map((k, p) => (hatIsBlack(2 * k + p, seed) ? "black" : "white"));
      document.querySelectorAll(".levine-colours").forEach((span) => (span.textContent = left === right ? left : `${left} and ${right}`));
      document.querySelectorAll(".levine-result").forEach((span) => (span.textContent = left === "black" && right === "black" ? "win" : "lose"));

      // The first-black strategy: each names the lowest black hat on the *other* stack
      const firstBlack = (p) => {
        let k = 1;
        while (!hatIsBlack(2 * k + p, seed)) k++;
        return k;
      };
      document.querySelectorAll(".levine-left-name").forEach((span) => (span.textContent = firstBlack(1)));
      document.querySelectorAll(".levine-right-name").forEach((span) => (span.textContent = firstBlack(0)));
    }

    figure.querySelector(".hats-shuffle").addEventListener("click", () => {
      seed = Math.floor(Math.random() * 2 ** 32);
      hats.querySelectorAll("path").forEach((hat, i) => {
        const k = Math.floor(i / 2) + 1;
        hat.setAttribute("fill", hatIsBlack(2 * k + (i % 2), seed) ? BLACK : WHITE);
      });
      describe();
    });

    // Start at the ground; called again on reveal, since a hidden scroller can't scroll
    function toGround() {
      scroller.scrollTop = scroller.scrollHeight;
      extend();
    }

    addHats(40);
    describe();
    toGround();
    scroller.addEventListener("scroll", extend, { passive: true });
    scroller.addEventListener("scroll", fadeBottom, { passive: true });
    document.addEventListener("gate:reveal", (event) => event.target.contains(figure) && toGround());
  });

  document.querySelectorAll(".hats-figure .hats-shuffle").forEach((button) => {
    const figure = button.closest(".hats-figure");
    button.addEventListener("click", () => (figure.dataset.colours ? rerollColours(figure) : reroll()));
  });
})();
