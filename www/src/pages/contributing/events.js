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
        </Helmet>
        <h1 id="contributing-gatsby" css={{ marginTop: 0 }}>
          Gatsby Community Events
        </h1>
        <p>
          These events feature Gatsby team members and people from the Gatsby
          community.
        </p>
        <p>
          Want to see your event featured here?{` `}
          <a href="https://airtable.com/shrpwc99yogJm9sfI">
            Submit your event!
          </a>
        </p>
        <Events />
        <EmailCaptureForm signupMessage="Want to keep up with the latest tips &amp; tricks? Subscribe to our newsletter!" />
        <FooterLinks />
      </Container>
    </DocSearchContent>
  </Layout>
)

export default IndexRoute
