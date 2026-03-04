import { contextBridge, ipcRenderer } from "electron";

console.log("✅ preload loaded");

contextBridge.exposeInMainWorld("api", {
  ping: () => "pong",
  // openFile: () => ipcRenderer.invoke("file:open"),
  runWorker: () => ipcRenderer.invoke("worker:test"),
});
