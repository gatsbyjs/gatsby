import React from 'react'

import { rhythm } from 'utils/typography'

const DocsTemplate = React.createClass({
  render () {
    return (
      <div>
        <h1>{this.props.data.markdown.frontmatter.title}</h1>
        <div dangerouslySetInnerHTML={{ __html: this.props.data.markdown.bodyHTML }} />
      </div>
    )
  },
})

export default DocsTemplate

export const pageQuery = `
  query BlogPostByPath($filePath: String!) {
    markdown(path: $filePath) {
      id
      bodyHTML
      frontmatter {
        title
      }
    }
  }
`
