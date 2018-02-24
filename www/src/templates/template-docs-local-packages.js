import React from "react"
import Helmet from "react-helmet"
import distanceInWords from "date-fns/distance_in_words"

import { rhythm, scale } from "../utils/typography"
import presets from "../utils/presets"
import Container from "../components/container"
import MarkdownPageFooter from "../components/markdown-page-footer"

class DocsLocalPackagesTemplate extends React.Component {
  // metadaa has unique repository, last modified, keywords, last publisher
  render() {
    console.log(this.props)
    const metaData = this.props.data.npmPackage
    const localPackageData = this.props.data.markdownRemark
    const packageName = localPackageData.fields.title
    const excerpt = localPackageData.excerpt
    const lastUpdated = `${distanceInWords(
      new Date(metaData.modified),
      new Date()
    )} ago`
    const html = localPackageData.html
    const github = `https://github.com/gatsbyjs/gatsby/tree/master/packages/${packageName}`

    const gatsbyKeywords = [`gatsby`, `gatsby-plugin`, `gatsby-component`]
    const tags = metaData.keywords
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
            content={`${localPackageData.timeToRead} min read`}
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
        <MarkdownPageFooter page={localPackageData} packagePage />
      </Container>
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
      repository {
        url
      }
    }
  }
`
