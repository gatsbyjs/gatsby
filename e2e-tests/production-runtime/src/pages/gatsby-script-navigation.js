import * as React from "react"
import { Link } from "gatsby"

const pages = [
  {
    name: `Scripts with sources`,
    path: `/gatsby-script-scripts-with-sources/`,
  },
  { name: `Inline scripts`, path: `/gatsby-script-inline-scripts/` },
  {
    name: `Scripts from SSR and browser apis`,
    path: `/gatsby-script-ssr-browser-apis/`,
  },
]

function IndexPage() {
  return (
    <main style={{ margin: `1em` }}>
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
