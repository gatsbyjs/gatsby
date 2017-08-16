import React from "react"
import Link from "gatsby-link"
import "./style.css"

class SiteNav extends React.Component {
  render() {
    const { location } = this.props
    return (
      <nav className="blog-nav">
        <ul>
          <li>
            <Link
              to="/"
              className={location.pathname === `/` ? `current` : null}
            >
              {` `}Articles
            </Link>
          </li>
          <li>
            <Link
              to="/contact"
              className={location.pathname === `/contact/` ? `current` : null}
            >
              {` `}Contact me
            </Link>
          </li>
        </ul>
      </nav>
    )
  }
}

export default SiteNav
