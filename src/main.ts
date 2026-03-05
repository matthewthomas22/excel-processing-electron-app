import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { Worker } from "worker_threads";

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  ipcMain.handle("excel:pivot", async (_, payload) => {
    return new Promise((resolve, reject) => {
      const worker = new Worker(path.join(__dirname, "worker.js"), {
        workerData: payload,
      });

      worker.on("message", resolve);
      worker.on("error", reject);
    });
  });

  win.loadFile(path.join(__dirname, "index.html"));
}

app.whenReady().then(createWindow);
