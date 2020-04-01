/* eslint-disable @typescript-eslint/explicit-function-return-type */
import * as path from "path"
import { loadNodeContent } from "../"

describe(`gatsby-source-filesystem`, () => {
  it(`can load the content of a file`, async () => {
    const content = await loadNodeContent({
      absolutePath: path.join(__dirname, `../index.ts`),
    })

    expect(content.length).toBeGreaterThan(0)
  })

  it(`rejects if file not found`, async () => {
    await loadNodeContent({
      absolutePath: path.join(__dirname, `haha-not-a-real-file.js`),
    }).catch(err => {
      expect(err).toBeDefined()
    })
  })
})
