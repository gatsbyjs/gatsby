import React from "react"

import { rhythm, scale } from "../utils/typography"
import presets from "../utils/presets"

const DocsTemplate = React.createClass({
  render() {
    const packageName = this.props.data.markdownRemark.pluginFields.title
    return (
      <div>
        <a
          href={`https://github.com/gatsbyjs/gatsby/tree/1.0/packages/${packageName}`}
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

export const pageQuery = graphql`
  query TemplateDocsQuery($slug: String!) {
    markdownRemark(pluginFields: { slug: { eq: $slug }}) {
      pluginFields {
        title
      }
      html
    }
  }
`
