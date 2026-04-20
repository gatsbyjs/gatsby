/**
 * @jest-environment jsdom
 */

import { onClientEntry } from "../gatsby-browser"
import * as catchLinks from "../catch-links"
describe(`gatsby-plugin-catch-links`, () => {
  let mockedCatchLinks
  beforeAll(() => {
    mockedCatchLinks = jest.spyOn(catchLinks, `default`)
  })
  afterAll(() => {
    mockedCatchLinks.mockRestore()
  })
  it(`calls catchLinks in gatsby-browser's onClientEntry API`, () => {
    onClientEntry()
    expect(mockedCatchLinks).toHaveBeenCalledWith(
      window,
      {},
      expect.any(Function)
    )
  })
})
