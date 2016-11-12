import React from 'react'
import Link from 'react-router/lib/Link'

import { rhythm } from 'utils/typography'
import 'css/markdown-styles.css'

const IndexRoute = React.createClass({
  render () {
    console.log('Docs index')
    return (
      <div>
        <h1>Pages</h1>
        <ul>
        {this.props.data.allMarkdown.edges.map((edge) => {
          return (
            <li key={edge.node.path}>
              <Link
                to={`/docs${edge.node.path}`}
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
  allMarkdown {
    edges {
      node {
        path
        frontmatter {
          title
        }
      }
    }
  }
}
`

