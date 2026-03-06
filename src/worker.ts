import { parentPort, workerData } from "worker_threads";
import * as XLSX from "xlsx";
import { PivotConfig } from "./types";

const { filePath, pivots, sheetName } = workerData;

const workbook = XLSX.readFile(filePath);
const sheet = workbook.Sheets[sheetName];

if (!sheet) {
  throw new Error(`Sheet "${sheetName} is not found in excel!"`);
}

const data = XLSX.utils.sheet_to_json<any>(sheet);

const results: any = pivots.map(() => ({}));

for (const row of data) {
  for (let i = 0; i < pivots.length; i++) {
    const pivot = pivots[i];
    const result = results[i];
    const hasColumnPivot = pivot.columns?.length > 0;

    // Build row key
    const rowKey = pivot.rows.map((k: string) => row[k]).join(" | ");

    const colKey = hasColumnPivot
      ? pivot.columns.map((k: string) => row[k]).join(" | ")
      : null;

    // init container
    result[rowKey] ??= hasColumnPivot ? {} : {};
    if (hasColumnPivot) {
      result[rowKey][colKey!] ??= {};
    }

    for (const [field, op] of Object.entries(pivot.values)) {
      const target = hasColumnPivot ? result[rowKey][colKey!] : result[rowKey];

      target[field] ??= 0;

      if (op === "sum") {
        target[field] += Number(row[field] ?? 0);
      }

      if (op === "count") {
        target[field] += 1;
      }
    }
  }
}

const finalResults = pivots.map((pivot: PivotConfig, index: number) => ({
  rows: pivot.rows,
  columns: pivot.columns,
  values: pivot.values,
  data: results[index],
}));

parentPort?.postMessage({ finalResults });
