// Progressive reveal for pages with gates (see builder/extensions/gates.py).
// The page is split into chunks at each gate; everything after the first gate starts hidden.
// A gate's first option reveals the next chunk. Any other option jumps to the last later gate with
// the same label, folding the chunks in between into a "Skipped" line that can be expanded.
// Revealing a chunk fires a "gate:reveal" event on it, so diagrams inside can lay themselves out.
(function () {
  const main = document.querySelector(".main-content");
  const gates = [...main.querySelectorAll(":scope > .gate")];
  if (!gates.length) return;

  const labelOf = (button) => button.textContent.trim();

  // chunks[k] holds everything after gate k-1, up to and including gate k
  const chunks = [];
  let current = null;
  for (const element of [...main.children]) {
    if (element.matches("header, script")) continue;
    if (current) current.append(element);
    if (element.classList.contains("gate")) {
      current = document.createElement("div");
      current.className = "gate-chunk";
      current.hidden = true;
      (chunks.at(-1) ?? element).after(current);
      chunks.push(current);
    }
  }
  // The first gate stays in the page; each later gate sits at the end of the chunk before it
  const chunkAfter = (gate) => chunks[gates.indexOf(gate)];

  function show(chunk) {
    if (!chunk.hidden) return;
    chunk.hidden = false;
    chunk.dispatchEvent(new CustomEvent("gate:reveal", { bubbles: true }));
  }

  // A used gate stays as a quiet divider showing the option that was picked
  function settle(gate, picked) {
    gate.classList.add("gate-used");
    gate.querySelectorAll("button").forEach((button) => {
      button.hidden = button !== picked;
      button.disabled = true;
    });
    if (!picked) gate.querySelector(".gate-option").hidden = false;
  }

  function open(gate, picked) {
    settle(gate, picked);
    show(chunkAfter(gate));
  }

  // The heading of the section an element sits in
  function sectionOf(element) {
    const before = [...main.querySelectorAll("h2")].filter((h) => h.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING);
    return before.length ? before.at(-1).textContent : "this section";
  }

  // Skip from `from` to the later gate `to`: fold the chunks in between into one expandable line
  function skip(from, to, picked) {
    settle(from, picked);
    // chunks[k] is everything after gate k, so this is from `from` up to and including `to`
    const skipped = chunks.slice(gates.indexOf(from), gates.indexOf(to));
    const headings = skipped.flatMap((chunk) => [...chunk.querySelectorAll("h2")].map((h) => h.textContent));
    const line = document.createElement("button");
    line.type = "button";
    line.className = "gate-skipped";
    line.textContent = `▸ Skipped: ${headings.length ? headings.join(", ") : `the rest of ${sectionOf(from)}`}`;
    line.addEventListener("click", () => {
      line.remove();
      skipped.forEach(show);
    });
    skipped[0].before(line);
    settle(to, [...to.querySelectorAll(".gate-option")].find((b) => labelOf(b) === labelOf(picked)));
    show(chunkAfter(to));
  }

  function showEverything() {
    main.querySelectorAll(".gate-skipped").forEach((line) => line.remove());
    gates.forEach((gate) => {
      if (!gate.classList.contains("gate-used")) settle(gate, null);
    });
    chunks.forEach(show);
  }

  gates.forEach((gate) => {
    const [first, ...others] = gate.querySelectorAll(".gate-option");
    first.addEventListener("click", () => open(gate, first));
    others.forEach((button) => {
      button.addEventListener("click", () => {
        const later = gates.slice(gates.indexOf(gate) + 1);
        const target = later.findLast((g) => [...g.querySelectorAll(".gate-option")].some((b) => labelOf(b) === labelOf(button)));
        if (target) skip(gate, target, button);
        else open(gate, button);
      });
    });
    gate.querySelector(".gate-all").addEventListener("click", showEverything);
  });
})();
