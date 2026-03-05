import type { PivotConfig } from "./types";
export {};

declare global {
  interface Window {
    api: {
      pivotExcel: (
        filePath: string,
        pivot: PivotConfig,
        sheetName: string
      ) => Promise<any>;

      getFilePath: (file: File) => string;
    };
  }
}
