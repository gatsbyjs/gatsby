import React from 'react'
import Link from 'react-router/lib/Link'

import { rhythm } from 'utils/typography'

const IndexRoute = React.createClass({
  render () {
    console.log('Docs index')
    console.log(this.props)
    return (
      <div>
        <h1>Pages</h1>
        <ul>
        {this.props.data.allMarkdownRemark.edges.map((edge) => {
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
        frontmatter {
          title
        }
      }
    }
  }
}
`

