import React from "react"
import { Link, withRouter } from "react-router-dom"
import { getCurrentUser, isLoggedIn, logout } from "../../utils/auth"
import styles from "./status.module.css"

export default withRouter(({ history }) => {
  let details
  if (!isLoggedIn()) {
    details = (
      <p className={styles[`status__text`]}>
        To get the full app experience, you’ll need to{` `}
        <Link to="/app/login">log in</Link>.
      </p>
    )
  } else {
    const { name, email } = getCurrentUser()

    details = (
      <p className={styles[`status__text`]}>
        Logged in as {name} ({email})!{` `}
        <a
          href="/"
          onClick={event => {
            event.preventDefault()
            logout(() => history.push(`/app/login`))
          }}
        >
          log out
        </a>
      </p>
    )
  }

  return <div className={styles.status}>{details}</div>
})
