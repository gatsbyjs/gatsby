import React from "react"
import { Link } from "gatsby"

const SecondPage = () => (
  <div>
    <h1>Hi from the second page</h1>
    <p>
      Welcome to page 2 of your
      <code>
        <a href="https://github.com/gatsbyjs/gatsby/search?utf8=%E2%9C%93&q=createRedirect">
          createRedirect
        </a>
      </code>
      &nbsp;<a href="https://www.gatsbyjs.org/docs/bound-action-creators/">
        bound action creator
      </a>
      &nbsp;example.
    </p>
    <p>
      These paths redirect{` `}
      <Link activeClassName="selected" to="/page2/">
        here
      </Link>:
    </p>
    <ul>
      <li>
        <Link to="/donut">/donut</Link>
      </li>
      <li>
        <Link to="/page2">/page2</Link> (missing hyphen between page and 2 and
        trailing slash)
      </li>
      <li>
        <Link to="/page2/">/page2/</Link> (missing hyphen between page and 2)
      </li>
    </ul>
    <p>
      Note how the trailing slash changes disappears and reappears in the
      address bar path when following the last two <code>/page2</code>
      &nbsp;links&nbsp;above. This demonstrates the need to handle
      trailing-slashed and non-trailing-slashed versions of{` `}
      <code>fromPath</code>
      &nbsp;separately when using <code>createRedirect</code> &nbsp;in{` `}
      <code>/gatsby-node.js</code>. Gatsby serves{` `}
      <a href="https://www.gatsbyjs.org/docs/building-with-components/">
        page components
      </a>
      &nbsp;at either version by default, but we need to explicitly redirect
      both versions independently (More on{` `}
      <a href="https://www.gatsbyjs.org/docs/creating-and-modifying-pages/#removing-trailing-slashes">
        handling trailing&nbsp;slashes
      </a>).
    </p>
    <p>These paths redirect to the homepage:</p>
    <ul>
      <li>
        <Link to="/orange">/orange</Link>
      </li>
      <li>
        <Link to="/soda">/soda</Link>
      </li>
    </ul>
    <Link to="/">Go back to the homepage</Link>
  </div>
)

export default SecondPage
