import React from "react"
import Link from "gatsby-link"
import { presets } from "glamor"

import { rhythm } from "utils/typography"

const IndexRoute = React.createClass({
  render () {
    console.log(`blog posts`, this.props)
    const blogPosts = this.props.data.allFile.edges.map((edge) => edge.node.children[0])
    console.log(blogPosts)
    return (
      <div
        css={{
          margin: 0,
          maxWidth: `100%`,
          [presets.Tablet]: {
            margin: `0 auto`,
            maxWidth: rhythm(26),
          },
        }}
      >
        <h1>Blog</h1>
        {blogPosts.map((post) => {
          return (
            <div>
              <h2
                css={{
                  marginBottom: 0,
                }}
              >
                {post.frontmatter.title}
              </h2>
              <p
                css={{
                  color: `#696861`,
                }}
              >
                {post.excerpt}
              </p>
              <div>
                <img
                  alt="Gravatar for mathews.kyle@gmail.com"
                  src="//www.gravatar.com/avatar/e567aa8adbd2d49cd9990ea1ed19d4eb?d=retro&amp;r=g&amp;s=50"
                  srcSet="//www.gravatar.com/avatar/e567aa8adbd2d49cd9990ea1ed19d4eb?d=retro&amp;r=g&amp;s=100 2x"
                  height="35" width="35"
                  css={{
                    borderRadius: `100%`,
                    display: `inline-block`,
                    marginRight: rhythm(1/2),
                    marginBottom: 0,
                    verticalAlign: `top`,
                  }}
                />
                <div
                  css={{
                    display: `inline-block`,
                  }}
                >
                  <div
                    css={{
                      color: `#696861`,
                      lineHeight: 1.1,
                    }}
                  >
                    <small>Kyle Mathews</small>
                  </div>
                  <div
                    css={{
                      color: `#696861`,
                      lineHeight: 1.1,
                    }}
                  >
                    <small><em>{post.frontmatter.date}</em></small>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  },
})

export default IndexRoute

export const pageQuery = `
{
  allFile(relativePath: { regex: "/blog-posts.*/" }) {
    edges {
      node {
        children {
          ... on MarkdownRemark {
            excerpt
            frontmatter {
              title
              date(formatString: "DD MMMM, YYYY")
            }
          }
        }
      }
    }
  }
}
`
