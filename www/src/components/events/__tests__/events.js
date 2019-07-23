import React from "react"
import { render } from "react-testing-library"

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

const mockEvents = events => {
  return {
    nodes: events,
  }
}

describe(`<Events />`, () => {
  it(`displays no events text if 0 events`, () => {
    const { getByText } = render(<Events events={mockEvents([])} />)

    expect(getByText(`No events are scheduled right now.`)).toBeVisible()
  })

  it(`splits upcoming and past events`, () => {
    const { getByText } = render(
      <Events
        events={mockEvents(
          [`1990-10-08`, `2100-10-08`, `2200-10-08`].map(toEvent)
        )}
      />
    )
    const upcoming = getByText(`Upcoming Events`)
    const past = getByText(`Past Events`)

    ;[upcoming, past].forEach(el => {
      expect(el.nextSibling.querySelectorAll(`li`).length).toBeGreaterThan(0)
    })
  })

  describe(`Simulate viewing an event today`, () => {
    let dateNowSpy

    beforeAll(() => {
      dateNowSpy = jest
        .spyOn(global.Date, `now`)
        .mockImplementation(() =>
          new Date(`1990-10-18T13:00:00.000Z`).valueOf()
        )
    })

    afterAll(() => {
      dateNowSpy.mockRestore()
    })

    it(`display's today's events as upcoming`, () => {
      const { getByText } = render(
        <Events events={mockEvents([`2100-10-08`].map(toEvent))} />
      )

      const upcoming = getByText(`Upcoming Events`)
      const past = getByText(`Past Events`)

      expect(upcoming.nextSibling.querySelectorAll(`li`).length).toBe(1)
      expect(past.nextSibling.querySelectorAll(`li`).length).toBe(0)
    })
  })
})
