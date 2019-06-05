import React from 'react'
import { Link } from 'gatsby'

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
        <Link to='/txt'>Notes</Link>
      </li>
    </ul>
  </header>
