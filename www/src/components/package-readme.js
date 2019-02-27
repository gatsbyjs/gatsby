import React from "react"
import PropTypes from "prop-types"
import { Helmet } from "react-helmet"

import { Link } from "gatsby"
import { colors } from "../utils/presets"
import Container from "../components/container"
import MarkdownPageFooter from "../components/markdown-page-footer"
import GithubIcon from "react-icons/lib/go/mark-github"

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
        <a
          css={{
            "&&": {
              display: githubUrl ? `flex` : `none`,
              fontWeight: `normal`,
              border: 0,
              color: colors.gray.calm,
              boxShadow: `none`,
              alignItems: `center`,
              "&:hover": {
                background: `none`,
                color: colors.gatsby,
              },
            },
          }}
          href={githubUrl}
          aria-labelledby="github-link-label"
        >
          <GithubIcon
            focusable="false"
            style={{ verticalAlign: `text-top`, marginRight: 10 }}
          />
          <span
            id="github-link-label"
            css={{
              "@media screen and (max-width: 385px)": {
                display: `none`,
              },
            }}
          >
            View plugin on GitHub
          </span>
        </a>
        {githubUrl && (
          <Link to={`/starters?d=${packageName}`}>
            See starters that use this
          </Link>
        )}
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
