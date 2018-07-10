import React, { Component } from "react"
import Helmet from "react-helmet"
import { rhythm } from "../utils/typography"

import Layout from "../components/layout"
import Container from "../components/container"
import EmailCaptureForm from "../components/email-capture-form"

class NewsLetter extends Component {
  render() {
    const { location, data } = this.props

    return (
      <Layout location={location}>
        <Helmet>
          <title>Newsletter</title>
        </Helmet>
        <Container
          hasSideBar={false}
          css={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <h1 id="introduction" style={{ marginTop: 0 }}>
            NewsLetter
          </h1>
          <div>
            Sign up for the Gatsby newsletter to keep up with the latest news
            and updates! We promise not to be spammy and you can unsubscribe at
            any time.
          </div>
          <div
            css={{
              marginTop: rhythm(1),
            }}
          >
            <EmailCaptureForm formOnly />
          </div>
        </Container>
      </Layout>
    )
  }
}

export default NewsLetter
