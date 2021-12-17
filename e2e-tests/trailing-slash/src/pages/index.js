import * as React from "react"
import { Link } from "gatsby"

const IndexPage = () => {
  return (
    <main>
      <h1>Trailing Slash Testing</h1>
      <ul>
        <li>
          <Link to="/page-2" data-testid="page-creator-without">
            Page Creator Without Trailing Slash
          </Link>
        </li>
        <li>
          <Link to="/page-2/" data-testid="page-creator-with">
            Page Creator With Trailing Slash
          </Link>
        </li>
        <li>
          <Link to="/create-page/with/" data-testid="create-page-with">
            Create Page With Trailing Slash
          </Link>
        </li>
        <li>
          <Link to="/create-page/without" data-testid="create-page-without">
            Create Page Without Trailing Slash
          </Link>
        </li>
        <li>
          <Link to="/fs-api/with/" data-testid="fs-api-with">
            FS API With Trailing Slash
          </Link>
        </li>
        <li>
          <Link to="/fs-api/without" data-testid="fs-api-without">
            FS API Without Trailing Slash
          </Link>
        </li>
        <li>
          <Link to="/page-2#anchor" data-testid="hash">
            Go to page-2 with hash
          </Link>
        </li>
        <li>
          <Link to="/page-2?query_param=hello" data-testid="query-param">
            Go to page-2 with query param
          </Link>
        </li>
        <li>
          <Link
            to="/page-2?query_param=hello#anchor"
            data-testid="query-param-hash"
          >
            Go to page-2 with query param and hash
          </Link>
        </li>
      </ul>
    </main>
  )
}

export default IndexPage
