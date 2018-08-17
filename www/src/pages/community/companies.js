import React, { Component } from "react"
import CommunityView from "../../views/community"

class CompaniesPage extends Component {
  render() {
    const { location } = this.props
    return <CommunityView location={location} title={`Companies`} />
  }
}

export default CompaniesPage
