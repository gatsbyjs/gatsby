import React from 'react'
import { Link } from 'gatsby'
// import Header from 'gatsby-theme-blog/src/gatsby-theme-header'

export default props =>
  <header>
    <h2>
      Custom Header
    </h2>
    <ul>
      <li>
        <Link to='/'>Blog</Link>
      </li>
      <li>
      </li>
    </ul>
  </header>
