import React from "react"
import PropTypes from "prop-types"
import Helmet from "react-helmet"

import { colors } from "../utils/presets"
import Container from "../components/container"
import MarkdownPageFooter from "../components/markdown-page-footer"
import GithubIcon from "react-icons/lib/go/mark-github"

class PackageReadMe extends React.Component {
  render() {
    const {
      page,
      packageName,
      excerpt,
      html,
      githubUrl,
      timeToRead,
    } = this.props

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
        <a
          css={{
            "&&": {
              display: githubUrl ? `inline-block` : `none`,
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
        >
          <GithubIcon style={{ verticalAlign: `text-top` }} />
        </a>

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
