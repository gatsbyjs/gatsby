import React from "react"

import { rhythm, scale } from "utils/typography"
import presets from "../utils/presets"

const DocsTemplate = React.createClass({
  render() {
    const packageName = this.props.data.markdownRemark.headings[0].value
    return (
      <div>
        <a
          href={
            `https://github.com/gatsbyjs/gatsby/tree/1.0/packages/${packageName}`
          }
          css={{
            ...scale(-1 / 5),
            position: `absolute`,
          }}
        >
          Github
        </a>
        <div
          css={{
            position: `relative`,
            top: rhythm(1),
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
      # Use headings to get the plugin name. A bit hacky but until
      # we can do sibling file queries to get to the package.json, this
      # is the easiest solution.
      headings {
        value
      }
      html
    }
  }
`
