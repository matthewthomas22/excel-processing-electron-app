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

type PivotResult = {
  rows: string[];
  columns: string[];
  values: Record<string, string>;
  data: Record<string, Record<string, Record<string, number>>>;
};

function renderPivotTable(result: PivotResult, whichTable: string) {
  const container = document.getElementById(whichTable);
  if (!container) return;

  // const columns = result.columns;
  const rows = Object.entries(result.data);

  // TH paling pertama
  let html = `
    <table class ="min-w-full table-auto border border-collapse border-slate-300 text-sm">
      <thead>
        <tr>
          <th class="border px-1 py-0.5 bg-slate-100 text-left font-semibold" >
            ${result.rows.join(" / ")}
          </th>
  `;

  const column_headers = Object.keys(result.values);

  // column headers
  for (const key of column_headers) {
    html += `
      <th class="border px-1 py-0.5 bg-slate-100 text-right font-semibold" >
        ${key}
      </th>
    `;
  }

  html += `
      </tr>
    </thead>
    <tbody>
  `;

  // rows
  for (const [rowKey, cols] of rows) {
    html += `
      <tr>
        <td class="border px-1 py-0.5 font-medium" >
          ${rowKey}
        </td>
    `;

    // console.log("This is cols ->", cols);

    for (const col of column_headers) {
      const value = (cols as any)[col];
      // const num = value ? Object.values(value)[0] : 0;

      html += `
        <td class="border px-1 py-0.5 font-medium" >
          ${value}
        </td>
      `;
    }

    html += `</tr>`;
  }
  html += `
    </tbody>
    </table>
  `;

  container.innerHTML = html;
}

async function runPivot() {
  if (!selectedFilePath) {
    alert("Please drop an excel file first!");
    return;
  }

  const btn = document.getElementById("runBtn") as HTMLButtonElement;

  btn.disabled = true;
  btn.classList.add("cursor-wait");
  document.body.classList.add("cursor-wait");

  try {
    const results = await window.api.pivotExcel(
      selectedFilePath,
      [
        {
          rows: ["BUTTON OK"],
          columns: [],
          values: {
            "Cons. 15mm": "sum",
            "Cons. 20mm": "sum",
            "CONS INSIDE 15mm": "sum",
          },
        },
        {
          rows: ["RIGHT S.PAD"],
          columns: [],
          values: {
            "RIGHT S.PAD": "count",
          },
        },
        {
          rows: ["SHOP MARK"],
          columns: [],
          values: {
            "SHOP MARK": "count",
          },
        },
      ],
      "UNTUK OLAH BLZ"
    );

    // console.group();
    console.log("This is result_button ", results);
    // console.log("This is result_spad ", result_spad);
    // console.log("This is result_label ", result_label);
    // console.groupEnd();

    renderPivotTable(results["finalResults"][0], "pivotTable");
    renderPivotTable(results["finalResults"][1], "pivotTableSpad");
    renderPivotTable(results["finalResults"][2], "pivotTableLabel");
  } finally {
    btn.disabled = false;
    btn.classList.remove("cursor-wait");
    document.body.classList.remove("cursor-wait");
  }
}

// expose function to HTML
(window as any).runPivot = runPivot;
