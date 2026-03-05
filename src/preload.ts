import { contextBridge, ipcRenderer } from "electron";
import { webUtils } from "electron";
import type { PivotConfig } from "./types";

console.log("✅ preload loaded");

contextBridge.exposeInMainWorld("api", {
  pivotExcel: (filePath: string, pivot: PivotConfig, sheetName: string) =>
    ipcRenderer.invoke("excel:pivot", { filePath, pivot, sheetName }),

  getFilePath: (file: File) => webUtils.getPathForFile(file),
  // ping: () => "pong",
  // openFile: () => ipcRenderer.invoke("file:open"),
  // runWorker: () => ipcRenderer.invoke("worker:test"),
});
