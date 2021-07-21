import * as path from "path"
import * as fs from "fs-extra"
import { savePageQueryResult, readPageQueryResult } from "../page-data"
import { isLmdbStore } from "../../datastore"

describe(`savePageQueryResults / readPageQueryResults`, () => {
  it(`can save and read data`, async () => {
    const fileDir = path.join(process.cwd(), `.cache`, `json`)
    await fs.emptyDir(fileDir)

    const pagePath = `/foo/`
    const inputResult = {
      data: { foo: `bar` },
    }

    const programDir = process.cwd()
    const publicDir = path.join(programDir, `public`)
    const pageQueryResultsPath = path.join(
      programDir,
      `.cache`,
      `json`,
      `${pagePath.replace(/\//g, `_`)}.json`
    )

    await savePageQueryResult(programDir, pagePath, JSON.stringify(inputResult))

    const result = await readPageQueryResult(publicDir, pagePath)
    expect(result).toEqual(inputResult)
    // we expect partial page data file only in non-lmdb mode
    expect(fs.existsSync(pageQueryResultsPath)).toEqual(!isLmdbStore())
  })
})
