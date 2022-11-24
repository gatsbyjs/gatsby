import * as React from "react"
import { Link, graphql } from "gatsby"

const IndexPage = ({ data }) => {
  const {
    allPost: { nodes: posts },
  } = data
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
          <Link
            to="/fs-api/without/without"
            data-testid="fs-api-client-only-without"
          >
            FS API Client-Only Without Trailing Slash
          </Link>
        </li>
        <li>
          <Link to="/fs-api/with/with/" data-testid="fs-api-client-only-with">
            FS API Client-Only With Trailing Slash
          </Link>
        </li>
        <li>
          <Link to="/fs-api-simple/with/" data-testid="fs-api-simple-with">
            FS API Simple With Trailing Slash
          </Link>
        </li>
        <li>
          <Link to="/fs-api-simple/without" data-testid="fs-api-simple-without">
            FS API Simple Without Trailing Slash
          </Link>
        </li>
        <li>
          <Link to="/page-2#anchor" data-testid="hash">
            Go to page-2 with hash
          </Link>
        </li>
        <li>
          <Link to="/page-2/#anchor" data-testid="hash-trailing">
            Go to page-2 with hash With Trailing Slash
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
        <li>
          <Link
            to="/client-only/without"
            data-testid="client-only-simple-without"
          >
            Client-Only Simple Without Trailing Slash
          </Link>
        </li>
        <li>
          <Link to="/client-only/with/" data-testid="client-only-simple-with">
            Client-Only Simple With Trailing Slash
          </Link>
        </li>
        <li>
          <Link
            to="/client-only-splat/without/without"
            data-testid="client-only-splat-without"
          >
            Client-Only-Splat Without Trailing Slash
          </Link>
        </li>
        <li>
          <Link
            to="/client-only-splat/with/with/"
            data-testid="client-only-splat-with"
          >
            Client-Only-Splat With Trailing Slash
          </Link>
        </li>
        {posts.map(post => (
          <li key={post._id}>
            <Link to={post.gatsbyPath} data-testid={`gatsby-path-${post._id}`}>
              Go to {post.slug} from gatsbyPath
            </Link>
          </li>
        ))}
        <li>
          <Link to="page-2" data-testid="relative-path-with-trailing-slash">
            Relative path with trailing slash
          </Link>
        </li>
      </ul>
    </main>
  )
}

export default IndexPage

export const query = graphql`
  {
    allPost {
      nodes {
        _id
        slug
        gatsbyPath(filePath: "/fs-api-simple/{Post.slug}")
      }
    }
  }
`
