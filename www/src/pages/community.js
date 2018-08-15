import React, { Component } from "react"
import CommunityView from "../views/community"

class CommunityPage extends Component {
  render() {
    const location = this.props.location
    return <CommunityView location={location} />
  }
}

export default CommunityPage
