import React from "react"

import { rhythm } from "utils/typography"
import { presets } from "glamor"

const DocsTemplate = React.createClass({
  render () {
    return (
      <div>
        <div
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
