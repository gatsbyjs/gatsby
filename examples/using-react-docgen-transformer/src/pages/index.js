import React from "react"
import { Route, Redirect } from "react-router-dom"

class Home extends React.Component {
  render() {
    return (
      <Route exact path="/" render={() => <Redirect to="/components/" />} />
    )
  }
}

export default Home
