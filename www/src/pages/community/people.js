import React, { Component } from "react"
import CommunityView from "../../views/community"

class PeoplePage extends Component {
  render() {
    const { location } = this.props
    return <CommunityView location={location} title={`People`} />
  }
}

export default PeoplePage
