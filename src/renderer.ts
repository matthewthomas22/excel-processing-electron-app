let selectedFilePath: string | null = null;

const runPivotBtn = document.getElementById("runBtn") as HTMLButtonElement;

runPivotBtn.disabled = true;

const dropZone = document.getElementById("dropZone");

dropZone?.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.classList.add("bg-indigo-50", "border-indigo-500");
});
dropZone?.addEventListener("dragleave", (e) => {
  dropZone.classList.remove("bg-indigo-50", "border-indigo-500");
});

dropZone?.addEventListener("drop", async (e) => {
  e.preventDefault();

  dropZone.classList.remove("bg-indigo-50", "border-indigo-500");

  const file = e.dataTransfer?.files[0];
  if (!file) return;

  // Electron specific: real-life path
  const filePath = window.api.getFilePath(file);

  console.log("This is file variable -> ", filePath);
  if (!filePath.endsWith(".xlsx") && !filePath.endsWith(".xls")) {
    alert("Please drop an excel file!");
    return;
  }

  selectedFilePath = filePath;

  dropZone.textContent = `Loaded ${file.name}`;

  runPivotBtn.disabled = false;
});

async function runPivot() {
  if (!selectedFilePath) {
    alert("Please drop an excel file first!");
    return;
  }

  const btn = document.getElementById("runBtn") as HTMLButtonElement;
  const out = document.getElementById("out");

  btn.disabled = true;
  btn.classList.add("cursor-wait");
  document.body.classList.add("cursor-wait");

  try {
    const result = await window.api.pivotExcel(
      selectedFilePath,
      {
        rows: ["BUTTON OK"],
        columns: [],
        values: {
          "Cons. 15mm": "sum",
          "Cons. 20mm": "sum",
          "CONS INSIDE 15mm": "sum",
        },
      },
      "UNTUK OLAH BLZ"
    );
    if (out) {
      out.innerText = JSON.stringify(result, null, 2);
    }
  } finally {
    btn.disabled = false;
    btn.classList.remove("cursor-wait");
    document.body.classList.remove("cursor-wait");
  }
}

// expose function to HTML
(window as any).runPivot = runPivot;
