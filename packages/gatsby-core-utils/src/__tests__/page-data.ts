import os from "os"
import { generatePageDataPath } from "../page-data"

describe(`page-data`, () => {
  it(`returns correct page data path`, () => {
    if (os.platform() !== `win32`) {
      expect(generatePageDataPath(`public`, `/path/1`)).toBe(
        `public/page-data/path/1/page-data.json`
      )

      expect(generatePageDataPath(`public`, `/`)).toBe(
        `public/page-data/index/page-data.json`
      )
    }

    if (os.platform() === `win32`) {
      expect(generatePageDataPath(`public`, `/path/1`)).toBe(
        `public\\page-data\\path\\1\\page-data.json`
      )

      expect(generatePageDataPath(`public`, `/`)).toBe(
        `public\\page-data\\index\\page-data.json`
      )
    }
  })
})
