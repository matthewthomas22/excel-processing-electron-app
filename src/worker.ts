import { parentPort, workerData } from "worker_threads";

let total = 0;

for (let i = 0; i < workerData.length; i++) {
  total += 1;
}

parentPort?.postMessage({
  result: total,
});
