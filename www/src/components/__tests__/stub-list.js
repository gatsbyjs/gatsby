jest.mock(`../../utils/sidebar/item-list`, () => {
  return {
    useItemList() {
      return null
    },
    useItemLists() {
      return {
        contributing: {
          title: `Contributing`,
          items: [
            {
              title: `Why Contribute to Gatsby?`,
              link: `/contributing/why-contribute-to-gatsby/`,
            },
            {
              title: `Gatsby's Governance Model`,
              link: `/contributing/gatsby-governance-model/`,
              stub: true,
            },
          ],
        },
        docs: {
          title: `Documentation`,
          items: [
            {
              title: `Introduction`,
              link: `/docs/`,
            },
          ],
        },
      }
    },
  }
})
import React from "react"
import { render } from "@testing-library/react"

import StubList from "../stub-list"

describe(`StubList`, () => {
  describe(`stubs`, () => {
    let stubs
    beforeEach(() => {
      const { getByTestId } = render(<StubList />)
      stubs = getByTestId(`list-of-stubs`).querySelectorAll(`li`)
    })

    it(`renders stubs`, () => {
      expect(stubs.length).toBeGreaterThan(0)
    })

    it(`renders links to stubs`, () => {
      Array.from(stubs).forEach(stub => {
        const anchor = stub.firstChild
        expect(anchor.nodeName).toBe(`A`)
        expect(anchor.getAttribute(`href`)).toMatch(/^\//)
      })
    })
  })
})
