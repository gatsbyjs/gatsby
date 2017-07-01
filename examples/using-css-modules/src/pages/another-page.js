import React from "react"
import Link from "gatsby-link"

import styles from "../styles/another-page.module.css"

class IndexComponent extends React.Component {
  render() {
    return (
      <div className={styles.page}>
        <h1 className={styles.header}>Hello mildly weary world</h1>
        <Link to="/" className={styles.link}>
          Back home
        </Link>
      </div>
    )
  }
}

export default IndexComponent
