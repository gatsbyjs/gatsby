import React from 'react'

class BlogPost extends React.Component {
  render() {
    const { html, frontmatter } = this.props.data.markdownRemark
    return (
      <div>
        <h1>{frontmatter.title}</h1>
        <div className="container content">
          <div dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      </div>
    )
  }
}

export default BlogPost

export const PageQuery = graphql`
  query blogPostBySlug($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      html
      frontmatter {
        title
      }
    }
    site {
      siteMetadata {
        title 
      }
    }
  }
`
