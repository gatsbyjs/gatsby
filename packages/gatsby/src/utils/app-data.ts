import path from "path"

import { outputJson, pathExistsSync } from "fs-extra"

const APP_DATA_JSON = `app-data.json`

export const write = (publicDir: string, hash: string): Promise<void> =>
  outputJson(path.join(publicDir, `page-data`, APP_DATA_JSON), {
    webpackCompilationHash: hash,
  })

export const exists = (publicDir: string): boolean =>
  pathExistsSync(path.join(publicDir, `page-data`, APP_DATA_JSON))
