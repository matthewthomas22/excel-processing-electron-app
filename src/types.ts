type PivotConfig = {
  rows: string[];
  columns: string[];
  values: Record<string, "sum" | "count">;
};

export { PivotConfig };
