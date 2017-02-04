import React from 'react'
import Link from 'react-router/lib/Link'

import { rhythm } from 'utils/typography'

const IndexRoute = React.createClass({
  render () {
    console.log('Docs index')
    console.log(this.props)
    const pages = this.props.data.allMarkdownRemark.edges
    const packagePages = pages.filter((page) => page.node.package)
    const otherPages = pages.filter((page) => !page.node.package)
    return (
      <div>
        <h1>Pages</h1>
        <h2>General Docs</h2>
        <ul>
        {otherPages.map((edge) => {
          return (
            <li key={edge.node.slug}>
              <Link
                to={`${edge.node.slug}`}
              >
                {edge.node.frontmatter.title}
              </Link>
            </li>
          )
        })}
        </ul>
        <h2>Official packages</h2>
        <ul>
        {packagePages.map((edge) => {
          return (
            <li key={edge.node.slug}>
              <Link
                to={`${edge.node.slug}`}
              >
                {edge.node.frontmatter.title}
              </Link>
            </li>
          )
        })}
        </ul>
      </div>
    )
  },
})

export default IndexRoute

export const pageQuery = `
{
  allMarkdownRemark {
    edges {
      node {
        slug
        package
        frontmatter {
          title
        }
      }
    }
  }
}
`

