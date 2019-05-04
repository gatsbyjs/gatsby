import React from "react"
import useCommunityEvents from "../../hooks/use-community-events"
import Event from "./event"

const Events = () => {
  const events = useCommunityEvents()

  const upcoming = events.filter(event => event.date >= Date.now())
  const past = events.filter(event => event.date < Date.now()).reverse()

  return events.length > 0 ? (
    <>
      <h2>Upcoming Events</h2>
      <ul>
        {upcoming.map(event => (
          <li key={event.id}>
            <Event {...event} />
          </li>
        ))}
      </ul>
      <h2>Past Events</h2>
      <ul>
        {past.map(event => (
          <li key={event.id}>
            <Event {...event} />
          </li>
        ))}
      </ul>
    </>
  ) : (
    <p>No events are scheduled right now.</p>
  )
}

export default Events
