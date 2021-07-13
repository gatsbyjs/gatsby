import React from "react"
import { cleanup, fireEvent, render } from "@testing-library/react"
import { OutboundLink } from "../"

describe(`<OutboundLink />`, () => {
  afterEach(() => {
    cleanup()
    jest.resetAllMocks()
  })

  const setup = props => {
    const utils = render(<OutboundLink {...props}>link</OutboundLink>)

    return Object.assign({}, utils, {
      link: utils.getByText(`link`),
    })
  }

  it(`matches basic snapshot`, () => {
    const { container } = setup()

    expect(container).toMatchSnapshot()
  })

  describe(`tracking`, () => {
    beforeEach(() => {
      window.gtag = jest.fn()
    })
    it(`sends tracking event when clicked`, () => {
      const { link } = setup()

      fireEvent.click(link)

      expect(window.gtag).toHaveBeenCalledTimes(1)
    })
    it(`sends custom tracking event when clicked`, () => {
      const eventCategory = `eventcategory`
      const eventAction = `eventaction`
      const eventLabel = `eventlabel`
      const eventValue = 55
      const { link } = setup({
        eventCategory,
        eventAction,
        eventLabel,
        eventValue,
      })

      fireEvent.click(link)

      expect(window.gtag).toHaveBeenCalledTimes(1)
      expect(window.gtag).toHaveBeenCalledWith(
        `event`,
        eventAction,
        expect.objectContaining({
          event_category: eventCategory,
          event_label: eventLabel,
          event_value: eventValue,
        })
      )
    })
  })
})
