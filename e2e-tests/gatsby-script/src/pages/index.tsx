import * as React from "react"
import { Link } from "gatsby"
import "../styles/global.css"

const pages = [
  { name: `Scripts with sources`, path: `/scripts-with-sources` },
  { name: `Inline scripts`, path: `/inline-scripts` },
]

function IndexPage() {
  return (
    <main>
      <h1>Script component e2e test</h1>
      <p>Tests are on other pages:</p>
      <ul>
        {pages.map(({ name, path }) => (
          <li>
            <a href={path}>{name}</a>
          </li>
        ))}
      </ul>
    </main>
  )
}

export default IndexPage
