import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { dialog } from "electron";
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

  ipcMain.handle("worker:test", async () => {
    return new Promise((resolve, reject) => {
      const worker = new Worker(path.join(__dirname, "worker.js"), {
        workerData: { iterations: 5_000_000 },
      });

      worker.on("message", resolve);
      worker.on("error", reject);
    });
  });

  win.loadURL(
    "data:text/html, " +
      encodeURIComponent(
        `<h1>Electron works</h1>
        <button onclick="run()" >Run Worker</button>
        <pre id="out" ></pre>

        <script>
            async function run(){
                const res = await window.api.runWorker()
                document.getElementById('out').innerText = JSON.stringify(res, null, 2)
            }
        </script>
        `
      )
  );
}

app.whenReady().then(createWindow);
