import React from "react"
import styled from "react-emotion"

import EmailCaptureForm from "../../components/email-capture-form"

import presets from "../../utils/presets"
import { rhythm } from "../../utils/typography"

const HomepageNewsletterRoot = styled(`section`)`
  background: #fff;
  margin: 0 -${rhythm(presets.gutters.default / 2)};
  padding: ${rhythm(presets.gutters.default / 2)};
  width: calc(100% + ${rhythm(presets.gutters.default)});
`

const HomepageNewsletter = ({ posts }) => (
  <HomepageNewsletterRoot>
    <EmailCaptureForm
      newStyle={true}
      confirmMessage="Success! You have been subscribed to the Gatsby newsletter. Expect to see a newsletter in your inbox each Wednesday (or the equivalent of US Wednesday in your time zone)!"
    />
  </HomepageNewsletterRoot>
)

export default HomepageNewsletter
