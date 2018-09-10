import React, { Component } from "react"
import HubspotForm from "react-hubspot-form"
import { css } from "glamor"
import { colors } from "../utils/presets"
import { rhythm, options } from "../utils/typography"
import hex2rgba from "hex2rgba"
import { formInput } from "../utils/form-styles"

let stripeAnimation = css.keyframes({
  "0%": { backgroundPosition: `0 0` },
  "100%": { backgroundPosition: `30px 60px` },
})

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
          color: colors.gatsby,
          fontFamily: options.headerFontFamily.join(`,`),
          padding: `15px`,
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
          "& .hs-form input": formInput,
          '& .hs-form input[type="text"], .hs-form input[type="email"], .hs-form input[type="number"]': {
            width: `100% !important`,
            ":focus": {
              borderColor: colors.gatsby,
              outline: 0,
              boxShadow: `0 0 0 0.2rem ${hex2rgba(colors.lilac, 0.25)}`,
            },
          },
          "& .hs-button.primary": {
            borderColor: colors.gatsby,
            color: colors.gatsby,
            cursor: `pointer`,
            fontWeight: `bold`,
            ":hover, &:focus": {
              backgroundSize: `30px 30px`,
              backgroundColor: colors.gatsby,
              backgroundImage: `linear-gradient(45deg, rgba(0,0,0, 0.1) 25%, transparent 25%, transparent 50%, rgba(0,0,0, 0.1) 50%, rgba(0,0,0, 0.1) 75%, transparent 75%, transparent)`,
              color: `#fff`,
              animation: `${stripeAnimation} 2.8s linear infinite`,
            },
            ":focus": {
              outline: 0,
              boxShadow: `0 0 0 0.2rem ${hex2rgba(colors.lilac, 0.25)}`,
            },
          },
        }}
      >
        <HubspotForm
          portalId={portalId}
          formId={formId}
          sfdcCampaignId={sfdcCampaignId}
          loading="Loading..."
          css=""
        />
      </div>
    )
  }
}
