import React from "react"
import { render } from "@testing-library/react"
import MdxLink, { shouldRenderRawLink } from "../mdx-link"

jest.mock("../localized-link", () => {
  // Mock the component to use a different tag so we can easily differentiate
  return () => <span />
})

describe("mdx-link", () => {
  it("creates a raw link on external links", () => {
    const { container } = render(
      <MdxLink href="https://github.com/gatsbyjs.gatsby" />
    )
    expect(container.firstChild.nodeName).toBe("A")
  })

  it("creates a raw link on hashes", () => {
    const { container } = render(<MdxLink href="#gatsby" />)
    expect(container.firstChild.nodeName).toBe("A")
  })

  it("creates a raw link on files", () => {
    const { container } = render(<MdxLink href="/gatsby-cheat-sheet.pdf" />)
    expect(container.firstChild.nodeName).toBe("A")
  })

  it("creates a localized link for internal links", () => {
    const { container } = render(<MdxLink href="/docs" />)
    expect(container.firstChild.nodeName).toBe("SPAN")
  })
})
