import React from "react"
import { graphql } from "gatsby"
import _ from "lodash"
import Layout from "../components/layout"
import PageWithPluginSearchBar from "../components/page-with-plugin-searchbar"
import PackageReadme from "../components/package-readme"
import Unbird from "../components/unbird"

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
      <Layout location={this.props.location}>
        <PageWithPluginSearchBar location={this.props.location}>
          <PackageReadme
            page={markdownRemark ? _.pick(markdownRemark, `parent`) : false}
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
          <Unbird
            dataSetId="5c1ac24b4a828a169b6c235c"
            publicKey={process.env.UNBIRD_FEEDBACK_KEY_PLUGINLIB}
            feedbackPrompt="Have feedback on the Plugin Library?"
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
