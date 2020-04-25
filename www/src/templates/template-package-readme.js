/** @jsx jsx */

import { jsx } from "theme-ui"
import { graphql } from "gatsby"
import React from "react"
import { Helmet } from "react-helmet"

import PageWithPluginSearchBar from "../components/page-with-plugin-searchbar"
import Link from "./localized-link"
import Container from "./container"
import MarkdownPageFooter from "./markdown-page-footer"
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

export default function PackageReadmeTemplate({
  location,
  data: { npmPackage },
  pageContext: { isOfficial },
}) {
  const { childMarkdownRemark: readme } = npmPackage.readme

  const packageName = npmPackage.name

  // FIXME doesn't work for gatsby packages
  // githubUrl={`https://github.com/gatsbyjs/gatsby/tree/master/packages/${npmPackage.name}`}
  const githubUrl = isOfficial
    ? `https://github.com/gatsbyjs/gatsby/tree/master/packages/${packageName}`
    : npmPackage.repository?.url ??
      `https://github.com/search?q=${npmPackage.name}`

  const metaExcerpt = readme.excerpt ?? `Plugin information for ${packageName}`

  return (
    <PageWithPluginSearchBar location={location}>
      <Container>
        <Helmet>
          <title>{packageName}</title>
          <meta name="description" content={metaExcerpt} />
          <meta property="og:description" content={metaExcerpt} />
          <meta name="twitter:description" content={metaExcerpt} />
          <meta property="og:title" content={packageName} />
          <meta property="og:type" content="article" />
          <meta name="twitter.label1" content="Reading time" />
          <meta
            name="twitter:data1"
            content={`${readme.timeToRead} min read`}
          />
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
          dangerouslySetInnerHTML={{ __html: readme.html }}
        />
        <MarkdownPageFooter page={readme} packagePage />
      </Container>
      <FooterLinks />
    </PageWithPluginSearchBar>
  )
}

export const pageQuery = graphql`
  query($slug: String!) {
    npmPackage(slug: { eq: $slug }) {
      name
      keywords
      lastPublisher {
        name
        avatar
      }
    }
    repository {
      url
    }
    readme {
      childMarkdownRemark {
        html
        excerpt
        timeToRead
        ...MarkdownPageFooter
      }
    }
  }
`
