import React from "react"

import { rhythm } from "utils/typography"
import { presets } from "glamor"

const DocsTemplate = React.createClass({
  render () {
    return (
      <div>
        <div
          css={{
            marginTop: rhythm(-1/2),
            marginBottom: rhythm(2),
            [presets.Tablet]: {
              marginTop: 0,
              marginBottom: 0,
            },
          }}
          dangerouslySetInnerHTML={{
            __html: this.props.data.markdownRemark.html,
          }}
        />
      </div>
    )
  },
})

export default DocsTemplate

export const pageQuery = `
  query BlogPostByPath($slug: String!) {
    markdownRemark(slug: { eq: $slug }) {
      html
    }
  }
`
