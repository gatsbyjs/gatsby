import React from "react";
import browserHistory from "react-router/lib/browserHistory";

class AppShell extends React.Component {
  componentDidMount() {
    console.log(this.props.location);
    browserHistory.replace(this.props.location.pathname);
  }

  render() {
    return <div />;
  }
}

export default AppShell;
