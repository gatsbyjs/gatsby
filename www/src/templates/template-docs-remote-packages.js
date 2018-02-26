import React from "react"

import PackageReadme from "../components/package-readme"

class DocsRemotePackagesTemplate extends React.Component {
  render() {
    const { data: { npmPackage, markdownRemark } } = this.props
    return (
      <PackageReadme
        lastPublisher={npmPackage.lastPublisher}
        page={markdownRemark}
        packageName={npmPackage.name}
        excerpt={npmPackage.readme.childMarkdownRemark.excerpt}
        modified={npmPackage.modified}
        html={npmPackage.readme.childMarkdownRemark.html}
        githubUrl={npmPackage.repository}
        keywords={npmPackage.keywords}
        timeToRead={npmPackage.readme.childMarkdownRemark.timeToRead}
      />
    )
  }
}

export default DocsRemotePackagesTemplate

export const pageQuery = graphql`
  query TemplateDocsRemotePackages($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      ...MarkdownPageFooter
    }
    npmPackage(slug: { eq: $slug }) {
      name
      description
      keywords
      lastPublisher {
        name
        avatar
      }
      modified
      repository {
        url
      }
      readme {
        childMarkdownRemark {
          html
          timeToRead
        }
      }
    }
  }
`
