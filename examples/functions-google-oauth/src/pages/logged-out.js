import { Link } from "gatsby"
import React from "react"

import * as styles from "./index.module.scss"

const LoggedOut = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <h1 className={styles.title}>You're logged out!</h1>
      <Link to="/" className={styles.signInButton}>
        Go Home
      </Link>
    </div>
  )
}

export default LoggedOut
