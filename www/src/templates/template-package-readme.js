/** @jsx jsx */

import { jsx } from "theme-ui"
import { graphql } from "gatsby"
import { GoMarkGithub as GithubIcon } from "react-icons/go"
import { FaUsers as CommunityIcon } from "react-icons/fa"

import PageMetadata from "../components/page-metadata"
import Link from "../components/localized-link"
import Container from "../components/container"
import PageWithPluginSearchBar from "../components/page-with-plugin-searchbar"
import FooterLinks from "../components/shared/footer-links"
import GatsbyIcon from "../components/gatsby-monogram"

const GatsbyPluginBadge = ({ isOfficial }) => {
  const Icon = isOfficial ? GatsbyIcon : CommunityIcon
  const title = isOfficial
    ? `Official Gatsby Plugin`
    : `Community Gatsby Plugin`
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
}) {
  const readmePage = npmPackage.readme.childMarkdownRemark
  const isOfficial = npmPackage.fields.official
  const packageName = npmPackage.name

  const excerpt = readmePage.excerpt ?? `Plugin information for ${packageName}`
  const githubUrl = isOfficial
    ? `https://github.com/gatsbyjs/gatsby/tree/master/packages/${packageName}`
    : npmPackage.repository?.url ??
      `https://github.com/search?q=${npmPackage.name}`

  return (
    <PageWithPluginSearchBar location={location}>
      <PageMetadata
        title={packageName}
        description={excerpt}
        type="article"
        timeToRead={readmePage.timeToRead}
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
          dangerouslySetInnerHTML={{ __html: readmePage.html }}
        />
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
      fields {
        official
      }
      repository {
        url
      }
      readme {
        childMarkdownRemark {
          html
          excerpt
          timeToRead
        }
      }
    }
  }
`
