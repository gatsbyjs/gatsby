import fs from "fs-extra"
import path from "path"

const APP_DATA_JSON = `app-data.json`

export const write = (publicDir: string, hash: string): void => {
  fs.outputJson(path.join(publicDir, `page-data`, APP_DATA_JSON), {
    webpackCompilationHash: hash,
  })
}

export const exists = (publicDir: string): boolean =>
  fs.pathExistsSync(path.join(publicDir, `page-data`, APP_DATA_JSON))
