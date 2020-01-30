import React from "react"
import EnsureResources from "../ensure-resources"
import { render, getNodeText, cleanup } from "@testing-library/react"

jest.mock("../loader", () => ({
  loadPageSync(path) {
    return { loadPageSync: true, path }
  },
  loadPage(path) {
    return Promise.resolve({ loadPage: true, path })
  },
}))

afterAll(cleanup)

describe("EnsureResources", () => {
  it("works", () => {
    const location = {
      pathname: "/",
    }
    const { container } = render(
      <EnsureResources location={location}>
        {data => JSON.stringify(data.pageResources)}
      </EnsureResources>
    )
    console.log(container)

    expect(getNodeText(container)).toMatchInlineSnapshot(
      `"{\\"loadPageSync\\":true,\\"path\\":\\"/\\"}"`
    )
  })
})
