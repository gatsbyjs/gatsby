import React from "react"
import { Redirect } from "@reach/router"

class Home extends React.Component {
  render() {
    return <Redirect from="/" to="/components/" />
  }
}

export default Home
