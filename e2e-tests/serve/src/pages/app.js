import { Router } from "@reach/router"
import React from "react"

const App = () => <h1>App Page</h1>

const NotFound = () => <h1>Not Found in App</h1>

const AppPage = () => (
  <Router>
    <App path="/app" />
    <NotFound default />
  </Router>
)

export default AppPage
