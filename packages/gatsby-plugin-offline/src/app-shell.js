import React from "react"

class AppShell extends React.Component {
  componentDidMount() {
    window.___navigateTo(this.props.location.pathname)
  }

  render() {
    return <div />
  }
}

export default AppShell
