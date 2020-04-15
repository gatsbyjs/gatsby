import React from "react"
import { graphql } from "gatsby"
import Event from "./event"

export default function EventList({ events }) {
  const endOfDay = date => new Date(date).setHours(23, 59, 59, 999)

  // const upcoming = events.nodes.filter(
  //   event => endOfDay(event.data.date) >= Date.now()
  // )

  const past = events.nodes
    .filter(event => endOfDay(event.data.date) < Date.now())
    .reverse()

  return events.nodes.length > 0 ? (
    <>
    // Temporarily removing during COVID
      {/* <h2>Upcoming Events</h2>
      <ul>
        {upcoming.map(event => (
          <li key={event.id}>
            <Event event={event.data} />
          </li>
        ))}
      </ul> */}
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
