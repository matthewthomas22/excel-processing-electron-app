import { parentPort, workerData } from "worker_threads";
import * as XLSX from "xlsx";

const { filePath, pivot, sheetName } = workerData;

const workbook = XLSX.readFile(filePath);
const sheet = workbook.Sheets[sheetName];

if (!sheet) {
  throw new Error(`Sheet "${sheetName} is not found in excel!"`);
}

const data = XLSX.utils.sheet_to_json<any>(sheet);

const hasColumnPivot = pivot.columns.length > 0;

const result: any = {};

for (const row of data) {
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

parentPort?.postMessage({
  rows: pivot.rows,
  columns: pivot.columns,
  values: pivot.values,
  data: result,
});
