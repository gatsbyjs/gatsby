import { graphql, useStaticQuery } from "gatsby"
import EventList from "./event-list"

const Events = () => {
  const { events } = useStaticQuery(graphql`
    query {
      events: allAirtable(
        sort: { order: ASC, fields: [data___date] }
        filter: { data: { approved: { eq: true } } }
      ) {
        ...CommunityEvents
      }
    }
  `)
  return <EventList events={events} />
}

export default Events
