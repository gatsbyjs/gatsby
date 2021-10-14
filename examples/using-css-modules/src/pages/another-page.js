import React from "react"
import { Link } from "gatsby"

import { page, link, header } from "../styles/another-page.module.css"

class IndexComponent extends React.Component {
  render() {
    return (
      <div className={page}>
        <h1 className={header}>Hello mildly weary world</h1>
        <Link to="/" className={link}>
          Back home
        </Link>
      </div>
    )
  }
}

export default IndexComponent
