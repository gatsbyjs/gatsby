import React, { Component } from "react"
import CommunityView from "../../views/community"

class AgenciesPage extends Component {
  render() {
    const { location } = this.props
    return <CommunityView location={location} title={`Agencies`} />
  }
}

export default AgenciesPage
