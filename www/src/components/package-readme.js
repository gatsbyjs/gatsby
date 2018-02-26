import React from "react"
import Helmet from "react-helmet"
import distanceInWords from "date-fns/distance_in_words"

import { rhythm, scale } from "../utils/typography"
import presets from "../utils/presets"
import Container from "../components/container"
import MarkdownPageFooter from "../components/markdown-page-footer"

class PackageReadMe extends React.Component {
  render() {
    const {
      lastPublisher,
      page,
      packageName,
      excerpt,
      modified,
      html,
      githubUrl,
      keywords,
      timeToRead,
    } = this.props

    const lastUpdated = `${distanceInWords(new Date(modified), new Date())} ago`
    const gatsbyKeywords = [`gatsby`, `gatsby-plugin`, `gatsby-component`]
    const tags = keywords
      .filter(keyword => !gatsbyKeywords.includes(keyword))
      .join(`, `)

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
          <meta name="twitter:data1" content={`${timeToRead} min read`} />
        </Helmet>
        <strong>
          <a
            css={{
              display: githubUrl ? `inline-block` : `none`,
            }}
            href={githubUrl}
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
            <img width="20" height="20" src={lastPublisher.avatar} />
            <span
              css={{
                paddingLeft: rhythm(0.25),
                fontSize: rhythm(0.5),
                textTransform: `uppercase`,
              }}
            >
              {lastPublisher.name}
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

export default PackageReadMe
