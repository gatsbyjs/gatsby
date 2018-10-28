import React, { Component } from "react"
import HubspotForm from "react-hubspot-form"
import presets, { colors } from "../utils/presets"
import { rhythm, options } from "../utils/typography"
import hex2rgba from "hex2rgba"
import { formInput } from "../utils/form-styles"
import { buttonStyles } from "../utils/styles"

export default class GatsbyHubspotForm extends Component {
  render() {
    const portalId = this.props.portalId || this.props[`portal-id`]
    const formId = this.props.formId || this.props[`form-id`]
    const sfdcCampaignId =
      this.props.sfdcCampaignId || this.props[`sfdc-campaign-id`]

    // See https://designers.hubspot.com/docs/cos/hubspot-form-markup#styling-forms for information on how to style the form
    return (
      <div
        css={{
          backgroundColor: colors.ui.light,
          borderRadius: presets.radius,
          color: colors.gatsby,
          fontFamily: options.headerFontFamily.join(`,`),
          padding: `15px`,
          "& form": {
            margin: 0,
          },
          "& .hs-form fieldset": {
            maxWidth: `none`,
            width: `100%`,
          },
          "& .hs-form-field": {
            paddingBottom: `20px`,
          },
          "& ul.hs-error-msgs": {
            listStyleType: `none`,
            margin: 0,
            color: colors.warning,
            fontSize: rhythm(1 / 2),
          },
          "& .hs-form-required": {
            color: colors.warning,
          },
          "& .hs-form input": {
            ...formInput,
          },
          '& .hs-form input[type="text"], .hs-form input[type="email"], .hs-form input[type="number"]': {
            width: `100% !important`,
            ":focus": {
              borderColor: colors.gatsby,
              outline: 0,
              boxShadow: `0 0 0 0.2rem ${hex2rgba(colors.lilac, 0.25)}`,
            },
          },
          "& .hs-button.primary": {
            ...buttonStyles.default,
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
