(function () {
  const form = document.getElementById("pct-entry");
  const input = document.getElementById("pct-input");
  const error = document.getElementById("pct-error");
  const samplesElement = document.getElementById("pct-samples");
  const grid = document.getElementById("pct-grid");
  const resultNumber = document.getElementById("pct-result-number");
  const resultCopy = document.getElementById("pct-result-copy");
  const clearButton = document.getElementById("pct-clear");

  let samples = [3, 3, 7, 7, 11, 24, 45];

  function ceilDiv(numerator, denominator) {
    return Math.ceil(numerator / denominator);
  }

  function possibleCount(total, percentage) {
    const minimum = Math.max(1, ceilDiv((2 * percentage - 1) * total, 200));
    const maximum = Math.min(
      total,
      ceilDiv((2 * percentage + 1) * total, 200) - 1,
    );
    return minimum <= maximum ? minimum : null;
  }

  function firstFailure(total) {
    return samples.find(
      (percentage) => possibleCount(total, percentage) === null,
    );
  }

  function renderSamples() {
    samplesElement.replaceChildren();

    if (samples.length === 0) {
      const empty = document.createElement("span");
      empty.className = "pct-empty";
      empty.textContent = "No samples yet";
      samplesElement.appendChild(empty);
      return;
    }

    samples.forEach(function (percentage, index) {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "pct-sample";
      chip.textContent = percentage + "%  ×";
      chip.setAttribute("aria-label", "Remove " + percentage + "% sample");
      chip.addEventListener("click", function () {
        samples.splice(index, 1);
        render();
      });
      samplesElement.appendChild(chip);
    });
  }

  function renderGrid(possibleTotals) {
    const possibleSet = new Set(possibleTotals);
    grid.replaceChildren();

    for (let total = 1; total < 100; total += 1) {
      const cell = document.createElement("span");
      const isPossible = possibleSet.has(total);
      cell.className = "pct-total" + (isPossible ? " pct-total-possible" : "");
      cell.textContent = total;

      if (isPossible) {
        const counts = samples.map(function (percentage) {
          return possibleCount(total, percentage);
        });
        cell.title = samples.length
          ? "Possible counts: " + counts.join(", ")
          : "Possible";
      } else {
        cell.title = firstFailure(total) + "% cannot occur with N = " + total;
      }

      grid.appendChild(cell);
    }
  }

  function renderResult(possibleTotals) {
    const count = possibleTotals.length;

    if (samples.length === 0) {
      resultNumber.textContent = "No totals ruled out";
      resultCopy.textContent = "Add a rounded percentage to begin.";
      return;
    }

    if (count === 0) {
      resultNumber.textContent = "No possible totals below 100";
      resultCopy.textContent =
        "The smallest possible total is therefore at least 100.";
      return;
    }

    resultNumber.textContent =
      count + " possible total" + (count === 1 ? "" : "s");
    resultCopy.textContent =
      "Smallest: " +
      possibleTotals[0] +
      ". Candidates: " +
      possibleTotals.join(", ") +
      ".";
  }

  function render() {
    const possibleTotals = [];

    for (let total = 1; total < 100; total += 1) {
      if (firstFailure(total) === undefined) {
        possibleTotals.push(total);
      }
    }

    renderSamples();
    renderResult(possibleTotals);
    renderGrid(possibleTotals);
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const percentage = Number(input.value);

    if (!Number.isInteger(percentage) || percentage < 1 || percentage > 100) {
      error.textContent = "Enter a whole number from 1 to 100.";
      input.focus();
      return;
    }

    error.textContent = "";
    samples.push(percentage);
    input.value = "";
    render();
    input.focus();
  });

  clearButton.addEventListener("click", function () {
    samples = [];
    error.textContent = "";
    render();
    input.focus();
  });

  render();
})();
