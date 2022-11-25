import * as path from "path"
import * as fs from "fs-extra"
import {
  savePageQueryResult,
  readPageQueryResult,
  waitUntilPageQueryResultsAreStored,
} from "../page-data"

describe(`savePageQueryResults / readPageQueryResults`, () => {
  it(`can save and read data`, async () => {
    const fileDir = path.join(process.cwd(), `.cache`, `json`)
    await fs.emptyDir(fileDir)

    const pagePath = `/foo/`
    const inputResult = {
      data: { foo: `bar` },
    }

    await savePageQueryResult(pagePath, JSON.stringify(inputResult))

    await waitUntilPageQueryResultsAreStored()

    const result = await readPageQueryResult(pagePath)
    expect(JSON.parse(result)).toEqual(inputResult)
  })
})
