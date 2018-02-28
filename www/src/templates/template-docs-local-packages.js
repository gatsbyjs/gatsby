import React from "react"
import _ from "lodash"

import PackageReadme from "../components/package-readme"

class DocsLocalPackagesTemplate extends React.Component {
  render() {
    const npmPackageNotFound = {
      keywords: ["gatsby"],
      lastPublisher: {
        name: "User Not Found",
        avatar: "",
      },
      modified: new Date(),
    }
    const { data: { npmPackage, markdownRemark } } = this.props
    return (
      <PackageReadme
        page={_.pick(markdownRemark, "parent")}
        packageName={markdownRemark.fields.title}
        excerpt={markdownRemark.excerpt}
        html={markdownRemark.html}
        githubUrl={`https://github.com/gatsbyjs/gatsby/tree/master/packages/${
          markdownRemark.fields.title
        }`}
        timeToRead={markdownRemark.timeToRead}
        modified={
          npmPackage ? npmPackage.modified : npmPackageNotFound.modified
        }
        keywords={
          npmPackage ? npmPackage.keywords : npmPackageNotFound.keywords
        }
        lastPublisher={
          npmPackage
            ? npmPackage.lastPublisher
            : npmPackageNotFound.lastPublisher
        }
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
