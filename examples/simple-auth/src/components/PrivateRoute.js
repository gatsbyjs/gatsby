import React from "react"
import PropTypes from "prop-types"
import { Router, navigate } from "@reach/router"
import { isLoggedIn } from "../utils/auth"

// More info at https://reacttraining.com/react-router/web/example/auth-workflow
const PrivateRoute = ({ component: Component, ...rest }) => {
  if (!isLoggedIn() && window.location.pathname !== `/app/login`) {
    // If we’re not logged in, redirect to the home page.
    navigate(`/app/login`)
    return null
  }

  return (
    <Router>
      <Component {...rest} />
    </Router>
  )
}

PrivateRoute.propTypes = {
  component: PropTypes.any.isRequired,
}

export default PrivateRoute
