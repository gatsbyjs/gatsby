import React from "react"
import { navigate } from "gatsby"
import { Router } from "@reach/router"

import PrivateRoute from "../components/privateRoute"

import * as styles from "./index.module.scss"
const LoggedIn = () => {
  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <h1 className={styles.title}>Logged In!</h1>
        <button
          className={styles.signInButton}
          onClick={() => {
            const token = JSON.parse(window.localStorage["google:tokens"])[
              "access_token"
            ]
            fetch(`/api/logout?token=${window.localStorage["google:tokens"]}`, {
              method: "POST",
            })
              .then(() => {
                window.localStorage.removeItem("google:tokens")
                navigate("/logged-out")
              })
              .catch(err => {
                console.error(`Logout error: ${err}`)
              })
          }}
        >
          Logout
        </button>
      </div>
    </>
  )
}

export default function App() {
  return (
    <>
      <Router>
        <PrivateRoute path="/app" component={LoggedIn} />
      </Router>
    </>
  )
}
