import React from "react"
import { Link } from "gatsby"

const IndexPage = () => (
  <div>
    <h1>Hi people</h1>
    <p>
      Welcome to your new Gatsby
      <code>
        <a href="https://github.com/gatsbyjs/gatsby/search?utf8=%E2%9C%93&q=createRedirect">
          createRedirect
        </a>
      </code>
      &nbsp;<a href="https://www.gatsbyjs.org/docs/bound-action-creators/">
        bound action creator
      </a>
      {` `}
      example.
    </p>
    <p>
      These paths redirect{` `}
      <Link activeClassName="selected" to="/">
        here
      </Link>:
    </p>
    <ul>
      <li>
        <Link to="/grape">/grape</Link>
      </li>
      <li>
        <Link to="/juice">/juice</Link>
      </li>
    </ul>
    <p>
      The{` `}
      <Link activeClassName="selected" to="/">
        here
      </Link>
      {` `}
      link uses{` `}
      <a href="https://www.gatsbyjs.org/packages/gatsby-link/">gatsby-link</a>
      {` `}
      <code>activeClassName</code>
      &nbsp;support derived from{` `}
      <a href="https://github.com/ReactTraining/react-router/blob/master/packages/react-router-dom/docs/api/NavLink.md">
        React Router’s NavLink component
      </a>
      {` `}
      to apply the <code>selected</code>
      &nbsp;class to links that match to the active path, and{` `}
      <code>import './selected.css'</code>
      &nbsp;in <code>/src/layouts/index.js</code>
      &nbsp;makes the <code>.selected {`{ color: #396; }`}</code> &nbsp;style
      declaration globally available to both&nbsp;pages.
    </p>
    <p>These paths redirect to page 2:</p>
    <ul>
      <li>
        <Link to="/blue">/blue</Link>
      </li>
      <li>
        <Link to="/randirect">/randirect</Link>
      </li>
      <li>
        <Link to="/randorect">/randorect</Link>
      </li>
    </ul>
    <p>
      Check <code>/gatsby-node.js</code> &nbsp;to see how. Then go build
      something great.
    </p>
    <Link to="/page-2/">Go to page 2</Link>
  </div>
)

export default IndexPage
