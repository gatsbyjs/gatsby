import React from "react"
import PropTypes from "prop-types"
import { Helmet } from "react-helmet"

import { Link } from "gatsby"
import { colors } from "../utils/presets"
import { options } from "../utils/typography"
import Container from "../components/container"
import MarkdownPageFooter from "../components/markdown-page-footer"
import GithubIcon from "react-icons/lib/go/mark-github"
import GatsbyIcon from "../monogram.svg"

const PackageReadMe = props => {
  const { page, packageName, excerpt, html, githubUrl, timeToRead } = props

  return (
    <Container>
      <Helmet>
        <title>{packageName}</title>
        <meta name="description" content={excerpt} />
        <meta property="og:description" content={excerpt} />
        <meta name="twitter:description" content={excerpt} />
        <meta property="og:title" content={packageName} />
        <meta property="og:type" content="article" />
        <meta name="twitter.label1" content="Reading time" />
        <meta name="twitter:data1" content={`${timeToRead} min read`} />
      </Helmet>
      <div css={{ display: `flex`, justifyContent: `space-between` }}>
        <div
          css={{
            display: `flex`,
            alignItems: `center`,
          }}
        >
          <a
            css={{
              "&&": {
                marginRight: 25,
                display: githubUrl ? `inline-flex` : `none`,
                fontWeight: `normal`,
                border: 0,
                color: colors.gray.calm,
                boxShadow: `none`,
                "&:hover": {
                  background: `none`,
                  color: colors.gatsby,
                },
              },
            }}
            href={githubUrl}
            aria-label={`${packageName} source`}
            title={`View source on GitHub`}
          >
            <GithubIcon
              focusable="false"
              style={{ verticalAlign: `text-top` }}
            />
          </a>
          {githubUrl.indexOf(`https://github.com/gatsbyjs/gatsby`) === 0 &&
            packageName[0] !== `@` && (
              <div
                css={{
                  display: `flex`,
                  alignItems: `center`,
                  lineHeight: 1,
                  color: `#888`,
                  fontFamily: options.headerFontFamily.join(`, `),
                }}
              >
                <img
                  src={GatsbyIcon}
                  css={{
                    width: 18,
                    marginBottom: 0,
                    marginRight: 5,
                    filter: `grayscale(100%)`,
                    opacity: 0.5,
                  }}
                  alt={`Official Gatsby Plugin`}
                />
                Official Plugin
              </div>
            )}
        </div>
        {githubUrl && (
          <Link to={`/starters?d=${packageName}`}>
            See starters that use this
          </Link>
        )}
      </div>

      <div
        css={{
          position: `relative`,
          "& h1": {
            marginTop: 0,
          },
        }}
        dangerouslySetInnerHTML={{
          __html: html,
        }}
      />
      <MarkdownPageFooter page={page} packagePage />
    </Container>
  )
}

PackageReadMe.propTypes = {
  page: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
  packageName: PropTypes.string.isRequired,
  excerpt: PropTypes.string,
  html: PropTypes.string.isRequired,
  githubUrl: PropTypes.string,
  timeToRead: PropTypes.number,
  lastPublisher: PropTypes.object,
}

export default PackageReadMe
