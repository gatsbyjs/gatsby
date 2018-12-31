import React, { Component } from "react"
import { Helmet } from "react-helmet"
import { rhythm } from "../utils/typography"
import { colors } from "../utils/presets"

import Layout from "../components/layout"
import Container from "../components/container"
import EmailCaptureForm from "../components/email-capture-form"

class NewsLetter extends Component {
  render() {
    const { location } = this.props

    return (
      <Layout location={location}>
        <Helmet>
          <title>Newsletter</title>
        </Helmet>
        <Container
          hasSideBar={false}
          css={{
            display: `flex`,
            flexDirection: `column`,
          }}
        >
          <h1 id="introduction" style={{ marginTop: 0 }}>
            Newsletter
          </h1>
          <div>
            Sign up for the Gatsby newsletter to keep up with the latest from
            the Gatsby community! Hear about new features, tips & tricks, and
            what people are building.
          </div>

          <EmailCaptureForm
            signupMessage="Sign up for the Gatsby Newsletter"
            confirmMessage="Success! You have been subscribed to the Gatsby newsletter. Expect to see a newsletter in your inbox each Wednesday (or the equivalent of US Wednesday in your time zone)!"
            overrideCSS={{
              marginTop: rhythm(1),
              paddingTop: rhythm(1 / 2),
              borderTop: `2px solid ${colors.lilac}`,
            }}
          />
        </Container>
      </Layout>
    )
  }
}

export default NewsLetter
