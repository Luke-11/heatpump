const FORM_FIELDS_SELECTOR = "input, select, textarea";

function collectFormState() {
  const state = {};
  document.querySelectorAll(FORM_FIELDS_SELECTOR).forEach((element) => {
    const key = element.id;
    if (!key) {
      return;
    }

    if (element instanceof HTMLInputElement) {
      const inputType = element.type.toLowerCase();
      if (inputType === "checkbox" || inputType === "radio") {
        state[key] = element.checked;
      } else {
        state[key] = element.value;
      }
    } else if (
      element instanceof HTMLSelectElement ||
      element instanceof HTMLTextAreaElement
    ) {
      state[key] = element.value;
    }
  });
  return state;
}

function applyFormState(state) {
  if (!state || typeof state !== "object") {
    return;
  }

  Object.entries(state).forEach(([key, value]) => {
    const element = document.getElementById(key);
    if (!element) {
      return;
    }

    if (element instanceof HTMLInputElement) {
      const inputType = element.type.toLowerCase();
      if (inputType === "checkbox" || inputType === "radio") {
        element.checked = Boolean(value);
      } else {
        element.value = value ?? "";
      }
    } else if (
      element instanceof HTMLSelectElement ||
      element instanceof HTMLTextAreaElement
    ) {
      element.value = value ?? "";
    }
  });
}

async function saveStateToFile(state) {
  const timestamp = new Date().toISOString().split("T")[0];
  const serializedState = JSON.stringify(state, null, 2);
  const suggestedName = `heat-pump-quote-${timestamp}.json`;

  if (window.showSaveFilePicker) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName,
        types: [
          {
            description: "JSON Files",
            accept: { "application/json": [".json"] },
          },
        ],
      });

      const writable = await handle.createWritable();
      await writable.write(serializedState);
      await writable.close();
      alert("Quote data saved successfully.");
      return;
    } catch (error) {
      if (error.name === "AbortError") {
        return;
      }
      console.error(
        "showSaveFilePicker failed, falling back to browser download",
        error
      );
    }
  }

  const blob = new Blob([serializedState], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = suggestedName;

  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
  alert("Quote data download started.");
}

function setupFileLoader(onLoad) {
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "application/json";
  fileInput.style.display = "none";
  document.body.appendChild(fileInput);

  fileInput.addEventListener("change", (event) => {
    const { files } = event.target;
    if (!files || files.length === 0) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      try {
        const parsedState = JSON.parse(loadEvent.target.result);
        onLoad(parsedState);
        alert("Quote data loaded successfully.");
      } catch (error) {
        console.error("Failed to parse state file", error);
        alert("Unable to load quote data. Please check the file content.");
      } finally {
        fileInput.value = "";
      }
    };
    reader.readAsText(files[0]);
  });

  return fileInput;
}

document.addEventListener("DOMContentLoaded", () => {
  const saveButton = document.getElementById("saveStateBtn");
  const loadButton = document.getElementById("loadStateBtn");

  if (!saveButton || !loadButton) {
    return;
  }

  const fileInput = setupFileLoader((state) => {
    applyFormState(state);
  });

  saveButton.addEventListener("click", () => {
    const state = collectFormState();
    saveStateToFile(state);
  });

  loadButton.addEventListener("click", () => {
    fileInput.click();
  });
});
