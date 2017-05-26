import React from "react"
import { navigateTo } from "gatsby-link"

class AppShell extends React.Component {
  componentDidMount() {
    console.log(this.props.location)
    navigateTo(this.props.location.pathname)
  }

  render() {
    return <div />
  }
}

export default AppShell
