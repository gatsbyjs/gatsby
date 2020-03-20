/** @jsx jsx */
import { jsx } from "theme-ui"
import React from "react"
import PropTypes from "prop-types"
import { Helmet } from "react-helmet"

import { Link } from "gatsby"
import Container from "./container"
import MarkdownPageFooter from "./markdown-page-footer"
import FooterLinks from "./shared/footer-links"
import { GoMarkGithub as GithubIcon } from "react-icons/go"
import GatsbyIcon from "./gatsby-monogram"

const PackageReadMe = props => {
  const { page, packageName, excerpt, html, githubUrl, timeToRead } = props
  const metaExcerpt = excerpt || `Plugin information for ${packageName}`

  return (
    <React.Fragment>
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
          sx={{
            display: `flex`,
            flexWrap: `wrap`,
            justifyContent: `space-between`,
            pb: 6,
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
                  sx={{
                    variant: `links.muted`,
                    mr: 8,
                    "&&": {
                      border: 0,
                      color: `textMuted`,
                      display: `flex`,
                      fontWeight: `body`,
                    },
                    "&&:hover": {
                      color: `textMuted`,
                    },
                  }}
                >
                  <span
                    sx={{
                      display: `inline-block`,
                      mr: 2,
                    }}
                    title={`Official Gatsby Plugin`}
                  >
                    <GatsbyIcon />
                  </span>
                  Official Plugin
                </div>
              )}
            <a
              sx={{ variant: `links.muted` }}
              href={githubUrl}
              aria-labelledby="github-link-label"
            >
              <GithubIcon focusable="false" sx={{ mr: 2 }} />
              <span id="github-link-label">View plugin on GitHub</span>
            </a>
          </div>
          {githubUrl && (
            <Link
              to={`/starters?d=${packageName}`}
              sx={{ variant: `links.muted` }}
            >
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
    </React.Fragment>
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
