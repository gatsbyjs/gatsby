import * as React from "react"
import { Link } from "gatsby"
import "../styles/global.css"

const pages = [
  { name: `Scripts with sources`, path: `/scripts-with-sources` },
  { name: `Inline scripts`, path: `/inline-scripts` },
  {
    name: `Add scripts via Gatsby browser`,
    path: `/adds-scripts-via-gatsby-browser`,
  },
]

function IndexPage() {
  return (
    <main>
      <h1>Script component e2e test</h1>
      <p>Tests are on other pages, links below.</p>

      <p>Links to pages (anchor):</p>
      <ul>
        {pages.map(({ name, path }) => (
          <li>
            <a href={path} id="anchor-link">
              {`${name} (anchor)`}
            </a>
          </li>
        ))}
      </ul>

      <p>Links to pages (gatsby-link):</p>
      <ul>
        {pages.map(({ name, path }) => (
          <li>
            <Link to={path} id="gatsby-link">
              {`${name} (gatsby-link)`}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}

export default IndexPage
