import React from "react"
import { Helmet } from "react-helmet"
import { graphql } from "gatsby"

import Layout from "../../components/layout"
import { itemListContributing } from "../../utils/sidebar/item-list"
import Container from "../../components/container"
import EmailCaptureForm from "../../components/email-capture-form"
import DocSearchContent from "../../components/docsearch-content"
import FooterLinks from "../../components/shared/footer-links"
import Events from "../../components/events/events"

const EventsRoute = props => (
  <Layout location={props.location} itemList={itemListContributing}>
    <DocSearchContent>
      <Container>
        <Helmet>
          <title>Community Events</title>
          <meta
            name="description"
            content="Learn about other events happening around the globe to connect with other members of the Gatsby community"
          />
        </Helmet>
        <h1 id="contributing-gatsby" css={{ marginTop: 0 }}>
          Gatsby Community Events
        </h1>
        <p>
          Interested in connecting with the Gatsby community in person? Take a
          look at the list below to see community-organized Gatsby events.
        </p>
        <p>
          Want to see your event featured here?
          {` `}
          <a href="https://www.gatsbyjs.org/contributing/organize-a-gatsby-event/">
            Learn more about submitting your event for Gatsby support
          </a>
          {`. `}
          (Support can include free swag, $ for food, and more!)
        </p>
        <Events events={props.data.events} />
        <EmailCaptureForm signupMessage="Want to keep up with the latest tips &amp; tricks? Subscribe to our newsletter!" />
      </Container>
      <FooterLinks />
    </DocSearchContent>
  </Layout>
)

export default EventsRoute

export const query = graphql`
  query {
    events: allAirtable(
      sort: { order: ASC, fields: [data___date] }
      filter: { data: { approved: { eq: true } } }
    ) {
      ...CommunityEvents
    }
  }
`
