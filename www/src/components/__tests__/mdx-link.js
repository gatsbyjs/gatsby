import { shouldRenderRawLink } from "../mdx-link"

describe("mdx-link", () => {
  it("creates a raw link on external links", () => {
    expect(shouldRenderRawLink("https://github.com/gatsbyjs/gatsby")).toBe(true)
  })

  it("creates a raw link on hashes", () => {
    expect(shouldRenderRawLink("#gatsby")).toBe(true)
  })

  it("creates a raw link on files", () => {
    expect(shouldRenderRawLink("gatsby-cheat-sheet.pdf")).toBe(true)
  })

  it("creates a localized link for internal links", () => {
    expect(shouldRenderRawLink("/tutorial")).toBe(false)
    expect(shouldRenderRawLink("/tutorial/part-zero")).toBe(false)
  })
})
