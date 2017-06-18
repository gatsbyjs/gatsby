import React from "react"

class AppShell extends React.Component {
  componentDidMount() {
    // TODO check if page exists and if not,
    // force a hard reload.
    window.___navigateTo(this.props.location.pathname)
  }

  render() {
    return <div />
  }
}

export default AppShell
