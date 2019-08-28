import React from "react"
import { Helmet } from "react-helmet"
import Layout from "../components/layout"
import Container from "../components/container"
import { colors, space } from "../utils/presets"
import FooterLinks from "../components/shared/footer-links"
import EmailCaptureForm from "../components/email-capture-form"

const NewsLetter = props => {
  const { location } = props
  return (
    <Layout location={location}>
      <Helmet>
        <title>Newsletter</title>
        <meta
          name="description"
          content="Sign up for the Gatsby newsletter to keep up with the latest from the Gatsby community, hear about new features, tips & tricks, and what people are building."
        />
      </Helmet>
      <Container
        withSidebar={false}
        css={{ display: `flex`, flexDirection: `column` }}
      >
        <h1 id="introduction" style={{ marginTop: 0 }}>
          Newsletter
        </h1>
        <div>
          Sign up for the Gatsby newsletter to keep up with the latest from the
          Gatsby community! Hear about new features, tips & tricks, and what
          people are building.
        </div>
        <EmailCaptureForm
          signupMessage="Sign up for the Gatsby Newsletter"
          confirmMessage="Success! You have been subscribed to the Gatsby newsletter. Expect to see a newsletter in your inbox each Wednesday (or the equivalent of US Wednesday in your time zone)!"
          overrideCSS={{
            marginTop: space[5],
            paddingTop: space[3],
            borderTop: `2px solid ${colors.lilac}`,
          }}
        />
      </Container>
      <FooterLinks />
    </Layout>
  )
}
export default NewsLetter
