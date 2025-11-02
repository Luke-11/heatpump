const form = document.getElementById("materialsForm");
const statusEl = document.getElementById("status");
const rowTemplate = document.getElementById("rowTemplate");

const sectionMap = {
  pipeRates: ["pipeRates"],
  radiatorCosts: ["radiatorCosts"],
  cylinderBase: ["cylinderCosts", "base"],
  cylinderMultiplier: ["cylinderCosts", "typeMultiplier"],
  controlBase: ["controlSystems", "base"],
};

let currentData = null;

function showStatus(message, type = "ok") {
  statusEl.textContent = message;
  statusEl.classList.remove("ok", "err");
  statusEl.classList.add(type);
}

function hideStatus() {
  statusEl.textContent = "";
  statusEl.classList.remove("ok", "err");
  statusEl.style.display = "none";
}

function attachRowEvents(row) {
  row.querySelector(".remove-row").addEventListener("click", () => {
    row.remove();
  });
}

function addRow(sectionKey, key = "", value = "") {
  const tableBody = document.querySelector(
    `[data-section="${sectionKey}"] tbody`
  );
  const row = rowTemplate.content.firstElementChild.cloneNode(true);
  const [keyInput, valueInput] = row.querySelectorAll("input");
  keyInput.value = key;
  valueInput.value = value;
  attachRowEvents(row);
  tableBody.appendChild(row);
}

function renderSection(sectionKey, entries) {
  const tableBody = document.querySelector(
    `[data-section="${sectionKey}"] tbody`
  );
  tableBody.innerHTML = "";
  Object.entries(entries).forEach(([key, value]) =>
    addRow(sectionKey, key, value)
  );
}

function renderForm(data) {
  renderSection("pipeRates", data.pipeRates);
  renderSection("radiatorCosts", data.radiatorCosts);
  renderSection("cylinderBase", data.cylinderCosts.base);
  renderSection("cylinderMultiplier", data.cylinderCosts.typeMultiplier);
  renderSection("controlBase", data.controlSystems.base);

  form.elements.includedZones.value = data.controlSystems.includedZones ?? 2;
  form.elements.extraZoneFee.value = data.controlSystems.extraZoneFee ?? 0;
}

function collectSection(sectionKey) {
  const tableBody = document.querySelector(
    `[data-section="${sectionKey}"] tbody`
  );
  const rows = Array.from(tableBody.querySelectorAll("tr"));
  const result = {};

  rows.forEach((row) => {
    const key = row.querySelector('input[name="key"]').value.trim();
    const raw = row.querySelector('input[name="value"]').value;
    if (!key) return;
    const value = Number(raw);
    result[key] = Number.isFinite(value) ? value : 0;
  });

  return result;
}

function collectData() {
  return {
    pipeRates: collectSection("pipeRates"),
    radiatorCosts: collectSection("radiatorCosts"),
    cylinderCosts: {
      base: collectSection("cylinderBase"),
      typeMultiplier: collectSection("cylinderMultiplier"),
    },
    controlSystems: {
      base: collectSection("controlBase"),
      includedZones: Number(form.elements.includedZones.value || 0),
      extraZoneFee: Number(form.elements.extraZoneFee.value || 0),
    },
  };
}

async function loadData() {
  hideStatus();
  try {
    const res = await fetch("/api/materials", { cache: "no-store" });
    if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
    currentData = await res.json();
    renderForm(currentData);
  } catch (err) {
    console.error(err);
    showStatus(`Failed to load materials: ${err.message}`, "err");
  }
}

async function saveData(payload) {
  const res = await fetch("/api/materials", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload, null, 2),
  });
  if (!res.ok) throw new Error(`Save failed with status ${res.status}`);
  return res.json();
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  hideStatus();

  const updated = collectData();

  try {
    await saveData(updated);
    showStatus("Materials updated successfully.", "ok");
    currentData = updated;
  } catch (err) {
    console.error(err);
    showStatus(err.message, "err");
  }
});

form.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action='add-row']");
  if (!button) return;
  addRow(button.dataset.section);
});
loadData();
