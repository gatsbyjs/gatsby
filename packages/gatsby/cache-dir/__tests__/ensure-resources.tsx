/**
 * @jest-environment jsdom
 */

import React from "react"
import EnsureResources from "../ensure-resources"
import { render, getNodeText, cleanup } from "@testing-library/react"

jest.mock(`../loader`, () => {
  return {
    PageResourceStatus: {
      Error: `error`,
    },
    loadPageSync(path: string): { loadPageSync: boolean; path: string } {
      return { loadPageSync: true, path }
    },
    loadPage(path: string): Promise<{ loadPage: boolean; path: string }> {
      return Promise.resolve({ loadPage: true, path })
    },
  }
})

afterAll(cleanup)

describe(`EnsureResources`, () => {
  it(`loads pages synchronously`, () => {
    const location = {
      pathname: `/`,
      search: ``,
    }
    const { container } = render(
      <EnsureResources location={location}>
        {(data: any): string => JSON.stringify(data.pageResources)}
      </EnsureResources>
    )

    expect(getNodeText(container)).toMatchInlineSnapshot(
      `"{\\"loadPageSync\\":true,\\"path\\":\\"/\\"}"`
    )
  })
})
