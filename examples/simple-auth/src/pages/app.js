import React from "react"
import { Router } from "@reach/router"
import Layout from "../components/Layout"
import Details from "../components/Details"
import Home from "../components/Home"
import Login from "../components/Login"
import PrivateRoute from "../components/PrivateRoute"
import Status from "../components/Status"

const App = () => (
  <Layout>
    <Status />
    <Router>
      <PrivateRoute path="/profile" component={Home} />
      <PrivateRoute path="/details" component={Details} />
      <Login path="/login" />
    </Router>
  </Layout>
)

export default App
