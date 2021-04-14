import { Link } from "gatsby"
import React from "react"
import "./header.css"

const Header = ({ siteTitle }) => (
  <header>
    <div
      style={{
        margin: `0 auto`,
        maxWidth: 960,
        padding: `1.45rem 1.0875rem`,
      }}
    >
      <h3>{siteTitle}</h3>
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/self-care" data-cy-page-link>
              Self Care Tips
            </Link>
          </li>
          <li>
            <Link to="/emergency-kit">Self Care Emergency Kit</Link>
          </li>
        </ul>
      </nav>
    </div>
  </header>
)

export default Header
