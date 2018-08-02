import React, { Component } from "react"
import HubspotForm from "react-hubspot-form"

export default class GatsbyHubspotForm extends Component {
  render() {
    const { portalId, formId, sfdcCampaignId } = this.props

    // See https://designers.hubspot.com/docs/cos/hubspot-form-markup#styling-forms for information on how to style the form
    // Set css="" to disable HubSpot's default styles
    return (
      <HubspotForm portalId={portalId} formId={formId} sfdcCampaignId={sfdcCampaignId} loading="Loading..." />
    )
  }
}
