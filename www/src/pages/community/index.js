import React, { Component } from "react"
import CommunityView from "../../views/community"

class CommunityPage extends Component {
  render() {
    const { location } = this.props
    return <CommunityView location={location} title={`Community`} />
  }
}

export default CommunityPage
