import React from "react"
import Helmet from "react-helmet"
import distanceInWords from "date-fns/distance_in_words"

import { rhythm, scale } from "../utils/typography"
import presets from "../utils/presets"
import Container from "../components/container"
import MarkdownPageFooter from "../components/markdown-page-footer"

class PackageReadMe extends React.Component {
  render() {
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

export default PackageReadMe
