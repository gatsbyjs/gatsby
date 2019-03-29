import { graphql, useStaticQuery } from "gatsby"

const useCommunityEvents = () => {
  const {
    allAirtable: { nodes },
  } = useStaticQuery(graphql`
    {
      allAirtable {
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
            visible: Do_you_want_this_event_listed_on_the_gatsbyjs_org_events_page___public_page_
            approved: Approved_for_Mktg_Support
          }
        }
      }
    }
  `)

  const events = nodes.filter(node => node.data.visible)

  return events
}

export default useCommunityEvents
