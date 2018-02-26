import React from "react"
import _ from "lodash"

import PackageReadme from "../components/package-readme"

class DocsLocalPackagesTemplate extends React.Component {
  render() {
    const { data: { npmPackage, markdownRemark } } = this.props
    return (
      <PackageReadme
        lastPublisher={npmPackage.lastPublisher}
        page={_.pick(markdownRemark, "parent")}
        packageName={markdownRemark.fields.title}
        excerpt={markdownRemark.excerpt}
        modified={npmPackage.modified}
        html={markdownRemark.html}
        githubUrl={`https://github.com/gatsbyjs/gatsby/tree/master/packages/${
          markdownRemark.fields.title
        }`}
        keywords={npmPackage.keywords}
        timeToRead={markdownRemark.timeToRead}
      />
    )
  }
}

export default DocsLocalPackagesTemplate

export const pageQuery = graphql`
  query TemplateDocsLocalPackages($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      html
      excerpt
      timeToRead
      fields {
        title
      }
      ...MarkdownPageFooter
    }
    npmPackage(slug: { eq: $slug }) {
      keywords
      lastPublisher {
        name
        avatar
      }
      modified
    }
  }
`
