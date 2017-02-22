import React from "react"

import { rhythm } from "utils/typography"
import { presets } from "glamor"

const BlogPostTemplate = React.createClass({
  render () {
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
        <h1>{this.props.data.markdownRemark.frontmatter.title}</h1>
        <div
          dangerouslySetInnerHTML={{
            __html: this.props.data.markdownRemark.html,
          }}
        />
      </div>
    )
  },
})

export default BlogPostTemplate

export const pageQuery = `
  query BlogPostByPath($slug: String!) {
    markdownRemark(slug: { eq: $slug }) {
      html
      frontmatter {
        title
      }
    }
  }
`

