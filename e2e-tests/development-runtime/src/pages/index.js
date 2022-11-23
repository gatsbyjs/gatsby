import React from "react"
import { Link, graphql } from "gatsby"

import ClassComponent from "../components/class-component"
import Layout from "../components/layout"
import Image from "../components/image"
import Seo from "../components/seo"
import InstrumentPage from "../utils/instrument-page"

const IndexPage = ({ data }) => (
  <Layout>
    <h1>Hi people</h1>
    <p data-testid="page-component">Welcome to your new %GATSBY_SITE%</p>
    <p>Now go build something great.</p>
    <ClassComponent />
    <div style={{ maxWidth: `300px`, marginBottom: `1.45rem` }}>
      <Image />
    </div>
    <Link to="/page-2/" data-testid="page-two">
      Go to page 2
    </Link>
    <Link to="/안녕" data-testid="page-with-unicode-path">
      Go to page with unicode path
    </Link>
    <Link to="/foo/@something/bar" data-testid="page-with-encodable-path">
      Go to page with unicode path
    </Link>
    <Link to="/__non_existent_page__/" data-testid="broken-link">
      Go to a broken link
    </Link>
    <Link to="subdirectory/page-1" data-testid="subdir-link">
      Go to subdirectory
    </Link>
    <Link to="collection-routing/root" data-testid="collection-link">
      Go to collection routing
    </Link>
    <Link to="client-dynamic-route/foo" data-testid="client-dynamic-route-foo">
      Go to dynamic route (id: foo)
    </Link>
    <Link
      to="client-dynamic-route/splat/blah/blah/blah"
      data-testid="client-dynamic-route-splat"
    >
      Go to client route splat (splat: blah/blah/blah)
    </Link>
    <Link to="/new-page" data-testid="hot-reloading-new-file">
      Created by hot-reloading/new-file.js
    </Link>
    <Link to="/redirect-two/#anchor" data-testid="redirect-two-anchor">
      Go to redirect with hash
    </Link>
    <Link
      to="/redirect-two/?query_param=hello"
      data-testid="redirect-two-search"
    >
      Go to redirect with query param
    </Link>
    <Link
      to="/redirect-two/?query_param=hello#anchor"
      data-testid="redirect-two-search-anchor"
    >
      Go to redirect with query param and hash
    </Link>
    <h2>Blog posts</h2>
    <ul>
      {data.posts.edges.map(({ node }) => (
        <li key={node.id}>
          <Link to={node.fields.slug}>{node.frontmatter.title}</Link>
        </li>
      ))}
    </ul>
    <Link to="/gatsby-script-off-main-thread/" data-testid="off-main-thread">
      Go to off-main-thread scripts page
    </Link>
  </Layout>
)

export default InstrumentPage(IndexPage)

export const indexQuery = graphql`
  {
    posts: allMarkdownRemark(
      sort: { fields: [frontmatter___date], order: DESC }
    ) {
      edges {
        node {
          id
          fields {
            slug
          }
          frontmatter {
            title
          }
        }
      }
    }
  }
`
export const Head = () => (
  <Seo title="Home" keywords={[`gatsby`, `application`, `react`]} />
)
