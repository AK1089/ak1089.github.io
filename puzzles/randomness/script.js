const DURATION = 60; // seconds
const MAX_FLIPS = 100;
const COLS = 20;

const pad = document.getElementById("tap-pad");
const timerBar = document.getElementById("timer-bar");
const timerValue = document.getElementById("timer-value");
const flipsBar = document.getElementById("flips-bar");
const flipsValue = document.getElementById("flips-value");
const hint = document.querySelector(".tap-pad-prompt .hint");

let sequence = "";
let started = false;
let finished = false;
let startTime = null;
let timerInterval = null;

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function updateTimer() {
  const elapsed = (Date.now() - startTime) / 1000;
  const remaining = Math.max(0, DURATION - elapsed);

  timerBar.style.width = `${(remaining / DURATION) * 100}%`;
  timerValue.textContent = formatTime(remaining);

  if (remaining <= 0) {
    finish();
  }
}

// Encode 201 bits into 34 base64url characters
function encodeBits(userSeq, prngSeq, humanFirst) {
  // Build a 201-bit array: 100 user bits, 100 prng bits, 1 order bit
  const bits = [];
  for (const ch of userSeq) bits.push(ch === "T" ? 1 : 0);
  for (const ch of prngSeq) bits.push(ch === "T" ? 1 : 0);
  bits.push(humanFirst ? 0 : 1);

  // Pack into 6-bit groups → base64url characters
  const b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  let encoded = "";
  for (let i = 0; i < bits.length; i += 6) {
    let val = 0;
    for (let j = 0; j < 6; j++) {
      val = (val << 1) | (bits[i + j] || 0);
    }
    encoded += b64[val];
  }
  return encoded; // 34 chars
}

function generatePrng(length) {
  let s = "";
  for (let i = 0; i < length; i++) {
    s += Math.random() < 0.5 ? "H" : "T";
  }
  return s;
}

function formatGrid(seq) {
  let lines = [];
  for (let i = 0; i < seq.length; i += COLS) {
    lines.push(seq.slice(i, i + COLS).split("").join(" "));
  }
  return lines.join("\n");
}

// Minecraft-style obfuscation: cycle through random printable chars
const OBFUSCATION_CHARS = "CDEFGHIJKLMNOPQRSTUVWXYZcdefghijklmnopqrstuvwxyz0123456789!@#$%&*";
let obfuscationInterval = null;

function randomChar() {
  return OBFUSCATION_CHARS[Math.floor(Math.random() * OBFUSCATION_CHARS.length)];
}

function startObfuscation(el) {
  el.textContent = randomChar();
  obfuscationInterval = setInterval(() => {
    el.textContent = randomChar();
  }, 120);
}

function showResults() {
  const prngSeq = generatePrng(sequence.length);
  const humanFirst = Math.random() < 0.5;

  const seqA = humanFirst ? sequence : prngSeq;
  const seqB = humanFirst ? prngSeq : sequence;

  document.getElementById("sequence-a").textContent = formatGrid(seqA);
  document.getElementById("sequence-b").textContent = formatGrid(seqB);

  const answerLabel = humanFirst ? "A" : "B";

  const obscuredEl = document.getElementById("answer-obscured");
  const realEl = document.getElementById("answer-real");
  realEl.textContent = answerLabel;
  startObfuscation(obscuredEl);

  // Hover on the sentence reveals the letter
  const answerTextEl = document.querySelector(".answer-text");
  answerTextEl.addEventListener("mouseenter", () => {
    clearInterval(obfuscationInterval);
    obscuredEl.classList.add("hidden");
    realEl.classList.remove("hidden");
  });
  answerTextEl.addEventListener("mouseleave", () => {
    realEl.classList.add("hidden");
    obscuredEl.classList.remove("hidden");
    startObfuscation(obscuredEl);
  });

  const encoded = encodeBits(sequence, prngSeq, humanFirst);
  const shareUrl = `${location.origin}${location.pathname}?flips=${encoded}`;

  const copyButton = document.getElementById("copy-link");
  const copyStatus = document.getElementById("copy-status");

  copyButton.addEventListener("click", () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      copyStatus.classList.remove("hidden");
      setTimeout(() => copyStatus.classList.add("hidden"), 2000);
    });
  });

  document.getElementById("results").classList.remove("hidden");
}

function finish() {
  clearInterval(timerInterval);
  finished = true;
  pad.classList.remove("active");
  pad.classList.add("done");
  timerBar.style.width = "0%";
  timerValue.textContent = "0:00";
  hint.textContent = "Finished!";

  showResults();
}

function pulse() {
  pad.classList.remove("pulse");
  void pad.offsetWidth;
  pad.classList.add("pulse");
}

function recordFlip(key) {
  if (finished) return;

  if (!started) {
    started = true;
    startTime = Date.now();
    pad.classList.add("active");
    hint.textContent = "Keep going...";
    timerInterval = setInterval(updateTimer, 50);
  }

  if (sequence.length >= MAX_FLIPS) return;

  sequence += key;
  pulse();

  flipsBar.style.width = `${(sequence.length / MAX_FLIPS) * 100}%`;
  flipsValue.textContent = sequence.length;

  if (sequence.length >= MAX_FLIPS) {
    finish();
  }
}

pad.addEventListener("keydown", (e) => {
  const key = e.key.toUpperCase();
  if (key === "H" || key === "T") {
    e.preventDefault();
    recordFlip(key);
  }
});
