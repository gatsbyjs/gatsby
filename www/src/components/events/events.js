import React from "react"
import Event from "./event"

const Events = ({ events }) => {
  const upcoming = events.nodes.filter(event => event.data.date >= Date.now())
  const past = events.nodes
    .filter(event => event.data.date < Date.now())
    .reverse()

  return events.nodes.length > 0 ? (
    <>
      <h2>Upcoming Events</h2>
      <ul>
        {upcoming.map(event => (
          <li key={event.id}>
            <Event event={event.data} />
          </li>
        ))}
      </ul>
      <h2>Past Events</h2>
      <ul>
        {past.map(event => (
          <li key={event.id}>
            <Event event={event.data} />
          </li>
        ))}
      </ul>
    </>
  ) : (
    <p>No events are scheduled right now.</p>
  )
}

export default Events

export const query = graphql`
  fragment CommunityEvents on AirtableConnection {
    nodes {
      id
      data {
        date
        ...EventFragment
      }
    }
  }
`
