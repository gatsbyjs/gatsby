import React from "react"
import { navigate } from "gatsby"

const isBrowser = () => typeof window !== "undefined"

const isLoggedIn = () => {
  const user = getUser()
  return !!user.access_token
}

const getUser = () =>
  isBrowser() && window.localStorage.getItem("google:tokens")
    ? JSON.parse(window.localStorage.getItem("google:tokens"))
    : {}

const PrivateRoute = ({ component: Component, location, ...rest }) => {
  console.log("private")
  if (!isLoggedIn() && location.pathname !== `/`) {
    navigate("/")
    return null
  }
  return <Component {...rest} />
}
export default PrivateRoute
