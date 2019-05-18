import React from "react"
import { Helmet } from "react-helmet"

import Layout from "../../components/layout"
import { itemListContributing } from "../../utils/sidebar/item-list"
import Container from "../../components/container"
import EmailCaptureForm from "../../components/email-capture-form"
import DocSearchContent from "../../components/docsearch-content"
import FooterLinks from "../../components/shared/footer-links"
import Events from "../../components/events/events"

const IndexRoute = props => (
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
          look at the events below to see community organized Gatsby events,
          places the Gatsby team members are speaking, and conferences that
          Gatsby is sponsoring. We hope to see you at these events soon!
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
        <Events />
        <EmailCaptureForm signupMessage="Want to keep up with the latest tips &amp; tricks? Subscribe to our newsletter!" />
        <FooterLinks />
      </Container>
    </DocSearchContent>
  </Layout>
)

export default IndexRoute
