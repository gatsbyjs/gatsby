import React from "react"
import { render } from "react-testing-library"
import { useStaticQuery } from "gatsby"

import Events from "../events"

const toEvent = (date, id) => {
  return {
    id,
    data: {
      date: date,
      type: `event`,
      name: `something something`,
    },
  }
}

const mockEvents = events =>
  useStaticQuery.mockReturnValueOnce({
    allAirtable: {
      nodes: events,
    },
  })

describe(`<Events />`, () => {
  it(`displays no events text if 0 events`, () => {
    mockEvents([])
    const { getByText } = render(<Events />)

    expect(getByText(`No events are scheduled right now.`)).toBeVisible()
  })

  it(`splits upcoming and past events`, () => {
    mockEvents([`1990-10-08`, `2100-10-08`, `2200-10-08`].map(toEvent))

    const { getByText } = render(<Events />)
    const upcoming = getByText(`Upcoming Events`)
    const past = getByText(`Past Events`)

    ;[upcoming, past].forEach(el => {
      expect(el.nextSibling.querySelectorAll(`li`).length).toBeGreaterThan(0)
    })
  })
})
