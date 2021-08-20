import { getPageHtmlFilePath } from "../page-html"

describe("page-html", () => {
  it("returns correct html path", () => {
    expect(getPageHtmlFilePath("public", "/path/1")).toBe(
      "public/path/1/index.html"
    )

    expect(getPageHtmlFilePath("public", "/path/1/index.html")).toBe(
      "public/path/1/index.html"
    )
  })
})
