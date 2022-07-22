/**
 * @jest-environment jsdom
 */
jest.mock(`accessible-nprogress`)

import NProgress from "accessible-nprogress"
import {
  onClientEntry,
  onRouteUpdateDelayed,
  onRouteUpdate,
} from "../gatsby-browser"

describe(`gatsby-plugin-nprogress`, () => {
  describe(`onClientEntry`, () => {
    it(`calls NProgress.configure with the correct styles`, () => {
      const element = {}
      const createElement = jest.spyOn(document, `createElement`)
      const appendChild = jest.spyOn(document.head, `appendChild`)
      createElement.mockReturnValue(element)
      appendChild.mockReturnValue(true)
      NProgress.configure = jest.fn()

      onClientEntry(null, { showSpinner: false })

      expect(element.id).toEqual(`nprogress-styles`)
      expect(element.innerHTML).toMatchSnapshot()
      expect(NProgress.configure).toHaveBeenCalledWith({
        color: `#29d`,
        showSpinner: false,
      })
    })
  })

  describe(`onRouteUpdateDelayed`, () => {
    it(`calls NProgress.start`, () => {
      NProgress.start = jest.fn()

      onRouteUpdateDelayed()

      expect(NProgress.start).toHaveBeenCalledTimes(1)
    })
  })

  describe(`onRouteUpdate`, () => {
    it(`calls NProgress.done`, () => {
      NProgress.done = jest.fn()

      onRouteUpdate()

      expect(NProgress.done).toHaveBeenCalledTimes(1)
    })
  })
})
