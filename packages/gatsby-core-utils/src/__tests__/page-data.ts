import { pageDataFilePath } from "../page-data"

describe(`page-data`, () => {
  it(`returns correct page data path`, () => {
    expect(pageDataFilePath(`public`, `/path/1`)).toBe(
      `public/page-data/path/1/page-data.json`
    )

    expect(pageDataFilePath(`public`, `/`)).toBe(
      `public/page-data/index/page-data.json`
    )
  })
})
