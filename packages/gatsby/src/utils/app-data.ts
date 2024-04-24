import fs from "fs-extra";
import path from "node:path";

const APP_DATA_JSON = "app-data.json";

export function write(publicDir: string, hash: string): Promise<void> {
  return fs.outputJson(path.join(publicDir, "page-data", APP_DATA_JSON), {
    webpackCompilationHash: hash,
  });
}

export function exists(publicDir: string): boolean {
  return fs.pathExistsSync(path.join(publicDir, "page-data", APP_DATA_JSON));
}
