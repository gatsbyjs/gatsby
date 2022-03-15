/**
 * @jest-environment jsdom
 */

import React from "react"
import { render, cleanup } from "@testing-library/react"

jest.mock(`../loader`, () => {
  return {
    loadPageSync: jest.fn(
      (
        path: string
      ): {
        loadPageSync: boolean
        path: string
      } => {
        return { loadPageSync: true, path }
      }
    ),
    loadPage: function loadPage(
      path: string
    ): Promise<{ loadPage: boolean; path: string }> {
      return Promise.resolve({ loadPage: true, path })
    },
  }
})

jest.mock(`../page-renderer`, (): string => `InternalPageRenderer`)

import ProdPageRenderer from "../public-page-renderer-prod"
import loader from "../loader"

describe(`ProdPageRenderer`, () => {
  it(`loads pages synchronously`, () => {
    const location = {
      pathname: `/`,
    }
    render(<ProdPageRenderer location={location} />)

    expect(loader.loadPageSync).toHaveBeenCalled()
  })
})

afterAll(cleanup)

afterAll(jest.clearAllMocks)
