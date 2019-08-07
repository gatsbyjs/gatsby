import { graphql, useStaticQuery } from "gatsby"

const useCommunityEvents = () => {
  const {
    allAirtable: { nodes },
  } = useStaticQuery(graphql`
    {
      allAirtable(
        sort: { order: ASC, fields: [data___Date_of_Event] }
        filter: { data: { Approved_for_posting_on_event_page: { eq: true } } }
      ) {
        nodes {
          id
          data {
            name: Name_of_Event
            organizer_fname: Organizer_Name
            organizer_lname: Organizer_s_Last_Name
            date: Date_of_Event
            location: Location_of_Event
            url: Event_URL__if_applicable_
            type: What_type_of_event_is_this_
            hasGatsbyTeamSpeaker: Gatsby_Speaker_Approved
          }
        }
      }
    }
  `)

  const events = nodes.map(event => {
    return {
      id: event.id,
      ...event.data,
      date: new Date(`${event.data.date}T23:59:59.999Z`),
    }
  })

  return events
}

export default useCommunityEvents
