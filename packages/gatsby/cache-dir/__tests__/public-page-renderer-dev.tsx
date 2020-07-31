import React from "react"
import { render, cleanup } from "@testing-library/react"

jest.mock(`../loader`, () => {
  return {
    loadPageSync: jest.fn((path: string): {
      loadPageSync: boolean
      path: string
    } => {
      return { loadPageSync: true, path }
    }),
    loadPage: function loadPage(
      path: string
    ): Promise<{ loadPage: boolean; path: string }> {
      return Promise.resolve({ loadPage: true, path })
    },
  }
})

jest.mock(`../query-result-store`, () => {
  return {
    PageQueryStore: (): string => `PageQueryStore`,
  }
})

import DevPageRenderer from "../public-page-renderer-dev"
import loader from "../loader"

describe(`DevPageRenderer`, () => {
  it(`loads pages synchronously`, () => {
    const location = {
      pathname: `/`,
    }
    render(<DevPageRenderer location={location} />)

    expect(loader.loadPageSync).toHaveBeenCalled()
  })
})

afterAll(cleanup)

afterAll(jest.clearAllMocks)
