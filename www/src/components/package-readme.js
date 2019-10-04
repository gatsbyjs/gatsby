import React from "react"
import PropTypes from "prop-types"
import { Helmet } from "react-helmet"

import { Link } from "gatsby"
import { space } from "../utils/presets"
import Container from "../components/container"
import MarkdownPageFooter from "../components/markdown-page-footer"
import FooterLinks from "../components/shared/footer-links"
import GithubIcon from "react-icons/lib/go/mark-github"
import GatsbyIcon from "../assets/monogram.svg"
import { linkStyles } from "../utils/styles"

const PackageReadMe = props => {
  const { page, packageName, excerpt, html, githubUrl, timeToRead } = props
  const metaExcerpt = excerpt || `Plugin information for ${packageName}`

  return (
    <>
      <Container>
        <Helmet>
          <title>{packageName}</title>
          <meta name="description" content={metaExcerpt} />
          <meta property="og:description" content={metaExcerpt} />
          <meta name="twitter:description" content={metaExcerpt} />
          <meta property="og:title" content={packageName} />
          <meta property="og:type" content="article" />
          <meta name="twitter.label1" content="Reading time" />
          <meta name="twitter:data1" content={`${timeToRead} min read`} />
        </Helmet>
        <div
          css={{
            display: `flex`,
            flexWrap: `wrap`,
            justifyContent: `space-between`,
            paddingBottom: space[9],
            "&&:hover": {
              color: `inherit`,
            },
          }}
        >
          <div
            css={{
              display: `flex`,
              justifyContent: `space-between`,
            }}
          >
            {githubUrl.indexOf(`https://github.com/gatsbyjs/gatsby`) === 0 &&
              packageName[0] !== `@` && (
                <div
                  css={{
                    ...linkStyles,
                    color: `#aaa !important`,
                    marginRight: space[6],
                  }}
                >
                  <img
                    src={GatsbyIcon}
                    css={{
                      height: 16,
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
            <a
              css={{ ...linkStyles }}
              href={githubUrl}
              aria-labelledby="github-link-label"
            >
              <GithubIcon focusable="false" style={{ marginRight: space[2] }} />
              <span id="github-link-label">View plugin on GitHub</span>
            </a>
          </div>
          {githubUrl && (
            <Link to={`/starters?d=${packageName}`} css={{ ...linkStyles }}>
              See starters using this
            </Link>
          )}
        </div>
        <div
          css={{ position: `relative` }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
        <MarkdownPageFooter page={page} packagePage />
      </Container>
      <FooterLinks />
    </>
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
