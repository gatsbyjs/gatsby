import React from "react"

import Layout from "../components/layout"
import PageWithPluginSearchBar from "../components/page-with-plugin-searchbar"
import PackageReadme from "../components/package-readme"

class DocsRemotePackagesTemplate extends React.Component {
  render() {
    const {
      data: { npmPackage, markdownRemark },
    } = this.props
    return (
      <Layout location={this.props.location}>
        <PageWithPluginSearchBar history={this.props.history}>
          <PackageReadme
            page={markdownRemark}
            packageName={npmPackage.name}
            excerpt={npmPackage.readme.childMarkdownRemark.excerpt}
            html={npmPackage.readme.childMarkdownRemark.html}
            githubUrl={
              npmPackage.repository !== null
                ? npmPackage.repository.url
                : `https://github.com/search?q=${npmPackage.name}`
            }
            modified={npmPackage.modified}
            timeToRead={npmPackage.readme.childMarkdownRemark.timeToRead}
            keywords={npmPackage.keywords}
            lastPublisher={npmPackage.lastPublisher}
          />
        </PageWithPluginSearchBar>
      </Layout>
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
