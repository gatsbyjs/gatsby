import React from "react"
import Helmet from "react-helmet"
import distanceInWords from "date-fns/distance_in_words"

import { rhythm, scale } from "../utils/typography"
import presets from "../utils/presets"
import Container from "../components/container"
import MarkdownPageFooter from "../components/markdown-page-footer"

class DocsRemotePackagesTemplate extends React.Component {
  render() {
    // make this all one big destructuring
    const remotePackageData = this.props.data.npmPackage
    // const metaData = this.props.data.npmPackage
    const packageName = remotePackageData.name
    const excerpt = remotePackageData.readme.childMarkdownRemark.excerpt
    const lastUpdated = `${distanceInWords(
      new Date(remotePackageData.modified),
      new Date()
    )} ago`
    const html = remotePackageData.readme.childMarkdownRemark.html
    const github = remotePackageData.repository
      ? remotePackageData.repository.url
      : null

    const gatsbyKeywords = [`gatsby`, `gatsby-plugin`, `gatsby-component`]
    const tags = remotePackageData.keywords
      .filter(keyword => !gatsbyKeywords.includes(keyword))
      .join(`, `)

    console.log(this.props)
    return (
      <Container>
        <Helmet>
          <title>{packageName}</title>
          <meta name="description" content={excerpt} />
          <meta name="og:description" content={excerpt} />
          <meta name="twitter:description" content={excerpt} />
          <meta name="og:title" content={packageName} />
          <meta name="og:type" content="article" />
          <meta name="twitter.label1" content="Reading time" />
          <meta
            name="twitter:data1"
            content={`${
              page
                ? page.timeToRead
                : metaData.readme.childMarkdownRemark.timeToRead
            } min read`}
          />
        </Helmet>
        <strong>
          <a
            css={{
              display: github ? `inline-block` : `none`,
            }}
            href={github}
          >
            Browse source code for this package on GitHub
          </a>
        </strong>

        <div className="metadataHeader">
          <div
            css={{
              fontSize: rhythm(0.5),
              color: `#D3D3D3`,
            }}
          >
            {tags}
          </div>

          <div
            css={{
              display: `flex`,
              paddingTop: rhythm(0.25),
            }}
          >
            <img width="20" height="20" src={metaData.lastPublisher.avatar} />
            <span
              css={{
                paddingLeft: rhythm(0.25),
                fontSize: rhythm(0.5),
                textTransform: `uppercase`,
              }}
            >
              {metaData.lastPublisher.name}
            </span>
            <span css={{ paddingLeft: rhythm(0.25), fontSize: rhythm(0.5) }}>
              {lastUpdated}
            </span>
          </div>
        </div>

        <div
          css={{
            position: `relative`,
          }}
          dangerouslySetInnerHTML={{
            __html: html,
          }}
        />
        <MarkdownPageFooter page={page} packagePage />
      </Container>
    )
  }
}

export default DocsRemotePackagesTemplate

// these won't have timetoread since they are pulled from algolia
export const pageQuery = graphql`
  query TemplateDocsRemotePackages($slug: String!) {
    npmPackage(slug: { eq: $slug }) {
      name
      description
      deprecated
      keywords
      lastPublisher {
        name
        avatar
      }
      modified
      repository {
        url
        project
        user
      }
      humanDownloadsLast30Days
      readme {
        childMarkdownRemark {
          html
        }
      }
    }
  }
`
