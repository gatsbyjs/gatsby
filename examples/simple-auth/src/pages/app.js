import React from "react"
import { Route } from "react-router-dom"
import Layout from "../components/Layout"
import Details from "../components/Details"
import Home from "../components/Home"
import Login from "../components/Login"
import PrivateRoute from "../components/PrivateRoute"
import Status from "../components/Status"

const App = () => (
  <Layout>
    <Status />
    <PrivateRoute path="/app/profile" component={Home} />
    <PrivateRoute path="/app/details" component={Details} />
    <Route path="/app/login" component={Login} />
  </Layout>
)

export default App
