import React from "react"
import { graphql } from "gatsby"
import { pick } from "lodash-es"

import Layout from "../components/layout"
import PageWithPluginSearchBar from "../components/page-with-plugin-searchbar"
import PackageReadme from "../components/package-readme"

class DocsLocalPackagesTemplate extends React.Component {
  render() {
    const {
      data: { npmPackage, markdownRemark },
    } = this.props
    const npmPackageNotFound = {
      keywords: [`gatsby`],
      lastPublisher: {
        name: `User Not Found`,
        avatar: ``,
      },
      modified: new Date(),
    }
    const markdownRemarkNotFound = {
      html: `No Package Readme Found`,
      excerpt: ``,
      timeToRead: 0,
      fields: {
        title: npmPackage ? npmPackage.name : `Title Not Found`,
      },
    }

    return (
      <Layout location={location}>
        <PageWithPluginSearchBar location={location}>
          <PackageReadme
            page={markdownRemark ? pick(markdownRemark, `parent`) : false}
            packageName={
              markdownRemark
                ? markdownRemark.fields.title
                : markdownRemarkNotFound.fields.title
            }
            excerpt={
              markdownRemark
                ? markdownRemark.excerpt
                : markdownRemarkNotFound.excerpt
            }
            html={
              markdownRemark ? markdownRemark.html : markdownRemarkNotFound.html
            }
            githubUrl={`https://github.com/gatsbyjs/gatsby/tree/master/packages/${
              markdownRemark
                ? markdownRemark.fields.title
                : markdownRemarkNotFound.fields.title
            }`}
            timeToRead={
              markdownRemark
                ? markdownRemark.timeToRead
                : markdownRemarkNotFound.timeToRead
            }
            modified={
              npmPackage && npmPackage.modified
                ? npmPackage.modified
                : npmPackageNotFound.modified
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
        </PageWithPluginSearchBar>
      </Layout>
    )
  }
}

export default DocsLocalPackagesTemplate

export const pageQuery = graphql`
  query($slug: String!) {
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
      name
      keywords
      lastPublisher {
        name
        avatar
      }
    }
  }
`
