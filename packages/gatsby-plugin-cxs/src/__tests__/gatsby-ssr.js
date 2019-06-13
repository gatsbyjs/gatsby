jest.mock(`cxs`)

import React from "react"
import cxs from "cxs"
import { onRenderBody } from "../gatsby-ssr"

describe(`gatsby-plugin-cxs`, () => {
  describe(`onRenderBody`, () => {
    it(`sets the correct head components`, () => {
      cxs.css = jest.fn(() => `cxs-css`)
      const setHeadComponents = jest.fn()

      onRenderBody({ setHeadComponents })

      expect(setHeadComponents).toHaveBeenCalledTimes(1)
      expect(setHeadComponents).toHaveBeenCalledWith([
        <style
          id="cxs-ids"
          key="cxs-ids"
          dangerouslySetInnerHTML={{ __html: `cxs-css` }}
        />,
      ])
    })
  })
})
