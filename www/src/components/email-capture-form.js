import React from "react"
import { rhythm } from "../utils/typography"
import { colors } from "../utils/presets"
import HubspotForm from "./hubspot-form"

class EmailCaptureForm extends React.Component {
  render() {
    const { signupMessage, overrideCSS } = this.props

    return (
      <div
        css={{
          borderTop: `2px solid ${colors.lilac}`,
          marginTop: rhythm(3),
          paddingTop: `${rhythm(1)}`,
          ...overrideCSS,
        }}
      >
        <div>
          <p>{signupMessage}</p>
          <HubspotForm
            portalId="4731712"
            formId="089352d8-a617-4cba-ba46-6e52de5b6a1d"
            sfdcCampaignId="701f4000000Us7pAAC"
          />
        </div>
      </div>
    )
  }
}

EmailCaptureForm.defaultProps = {
  signupMessage: `Enjoyed this post? Receive the next one in your inbox!`,
  confirmMessage: `Thank you! Youʼll receive your first email shortly.`,
  overrideCSS: {},
}

export default EmailCaptureForm
