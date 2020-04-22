/** @jsx jsx */
import { jsx } from "theme-ui"
import { Component } from "react"

import HubspotForm from "./react-hubspot-form"
import { formInput, formInputFocus, buttonStyles } from "../utils/styles"

export default class GatsbyHubspotForm extends Component {
  render() {
    const portalId = this.props.portalId || this.props[`portal-id`]
    const formId = this.props.formId || this.props[`form-id`]
    const sfdcCampaignId =
      this.props.sfdcCampaignId || this.props[`sfdc-campaign-id`]

    // See https://designers.hubspot.com/docs/cos/hubspot-form-markup#styling-forms for information on how to style the form
    return (
      <div
        sx={{
          "& form": {
            margin: 0,
          },
          "& .hs-form fieldset": {
            maxWidth: `none`,
            width: `100%`,
          },
          "& .hs-form-field": {
            pb: 5,
          },
          "& ul.hs-error-msgs": {
            listStyleType: `none`,
            margin: 0,
            color: `warning`,
            fontSize: 1,
          },
          "& .hs-form input": {
            ...formInput,
          },
          '& .hs-form input[type="text"], .hs-form input[type="email"], .hs-form input[type="number"]': {
            width: `100% !important`,
            ":focus": {
              ...formInputFocus,
            },
          },
          "& label": {
            // a bit unsure about the implications of the next line
            display: `inline-block`,
            fontSize: 1,
            pb: 1,
          },
          "& .hs-form-required": {
            color: `textMuted`,
          },
          "& .hs-button.primary": {
            ...buttonStyles().default,
          },
        }}
      >
        <HubspotForm
          portalId={portalId}
          formId={formId}
          sfdcCampaignId={sfdcCampaignId}
          loading="Loading..."
          {...{ css: `` }}
        />
      </div>
    )
  }
}
