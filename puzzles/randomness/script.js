const DURATION = 60; // seconds
const MAX_FLIPS = 100;

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

function finish() {
  clearInterval(timerInterval);
  finished = true;
  pad.classList.remove("active");
  pad.classList.add("done");
  timerBar.style.width = "0%";
  timerValue.textContent = "0:00";
  hint.textContent = "Finished!";

  console.log("Sequence:", sequence);
  console.log("Length:", sequence.length);
}

function pulse() {
  pad.classList.remove("pulse");
  // Force reflow so the animation restarts
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
