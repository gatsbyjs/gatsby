/** @jsx jsx */
import { jsx } from "theme-ui"
import React from "react"
import PropTypes from "prop-types"

import MarkdownPageFooter from "./markdown-page-footer"
import PageMetadata from "./page-metadata"
import Link from "./localized-link"
import Container from "./container"
import FooterLinks from "./shared/footer-links"
import { GoMarkGithub as GithubIcon } from "react-icons/go"
import GatsbyIcon from "./gatsby-monogram"
import { FaUsers as CommunityIcon } from "react-icons/fa"

const GatsbyPluginBadge = ({ isOfficial }) => {
  const Icon = isOfficial ? GatsbyIcon : CommunityIcon
  const title = isOfficial
    ? "Official Gatsby Plugin"
    : "Community Gatsby Plugin"
  const text = isOfficial ? `Official Plugin` : `Community Plugin`

  return (
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
        title={title}
      >
        <Icon />
      </span>
      {text}
    </div>
  )
}

const PackageReadMe = props => {
  const { page, packageName, excerpt, html, githubUrl, timeToRead } = props
  const metaExcerpt = excerpt || `Plugin information for ${packageName}`
  const isOfficial =
    githubUrl.indexOf(`https://github.com/gatsbyjs/gatsby`) === 0 &&
    packageName[0] !== `@`

  return (
    <React.Fragment>
      <PageMetadata
        title={packageName}
        description={metaExcerpt}
        type="article"
        timeToRead={timeToRead}
      />
      <Container>
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
            <GatsbyPluginBadge isOfficial={isOfficial} />
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
