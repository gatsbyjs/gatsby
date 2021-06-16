import React from "react";
import { navigate } from "gatsby";
import { Router } from "@reach/router"

import PrivateRoute from "../components/privateRoute";
const LoggedIn = () => {
  return (
    <>
    <h1>Logged In!</h1>
    <button onClick={() =>   {
        const token = JSON.parse(window.localStorage['google:tokens'])['access_token']
        fetch(`/api/logout?token=${window.localStorage['google:tokens']}`, {
          method: "POST"
        }).then(() => {
          window.localStorage.removeItem('google:tokens')
          navigate('/logged-out')
        }).catch((err) => {
          console.error(`Logout error: ${err}`)
        })
        }}>
          Logout
        </button>
    </>
  )
}

export default function App() {
  // DON'T USE THIS PATTERN FOR AUTHENTICATING ROUTES! :)
  return (
    <>
    <Router>
      <PrivateRoute path="/app" component={LoggedIn} />
    </Router>
 
    </>
   );
}
