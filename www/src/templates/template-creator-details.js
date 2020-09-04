/** @jsx jsx */
import { jsx } from "theme-ui"
import React from "react"
import { graphql } from "gatsby"
import Link from "../components/localized-link"
import Img from "gatsby-image"
import CreatorsHeader from "../views/creators/creators-header"
import Badge from "../views/creators/badge"
import PageMetadata from "../components/page-metadata"
import FooterLinks from "../components/shared/footer-links"
import { mediaQueries } from "gatsby-design-tokens/dist/theme-gatsbyjs-org"
import { GoMarkGithub as GithubIcon } from "react-icons/go"

const removeProtocol = input => input.replace(/^https?:\/\//, ``)

const breakpoint2Columns = mediaQueries.md

const MetaTitle = ({ children }) => (
  <p
    sx={{
      margin: `0`,
      color: `textMuted`,
      mb: 1,
      flexShrink: 0,
      [mediaQueries.xs]: {
        width: 150,
      },
      [breakpoint2Columns]: {
        fontWeight: `bold`,
        mb: 0,
        textTransform: `none`,
      },
    }}
  >
    {children}
  </p>
)

const MetaSection = ({ children, background, last, first }) => (
  <div
    sx={{
      background: background ? background : `ui.background`,
      mx: -6,
      p: 6,
      borderTop: first ? 1 : null,
      borderBottom: last ? null : 1,
      borderColor: `ui.border`,
      [breakpoint2Columns]: {
        background: `transparent`,
        px: 0,
        mx: 0,
      },
      [mediaQueries.sm]: {
        display: `flex`,
      },
    }}
  >
    {children}
  </div>
)

export default function CreatorTemplate({ data }) {
  const creator = data.creatorsYaml
  const isAgencyOrCompany =
    creator.type === `agency` || creator.type === `company`

  const sites = data.allSitesYaml.nodes

  return (
    <React.Fragment>
      <PageMetadata
        title={`${creator.name} - Creator`}
        description={creator.description}
      />
      <CreatorsHeader submissionText="Add Yourself" />
      <main
        role="main"
        sx={{
          p: 6,
          pb: `10vh`,
          display: `flex`,
          flexDirection: `column`,
          alignItems: `center`,
          justifyContent: `center`,
          width: `100%`,
          [breakpoint2Columns]: {
            pb: 6,
            flexDirection: `row`,
            alignItems: `flex-start`,
          },
        }}
      >
        <div
          sx={{
            m: 6,
            mb: 1,
            flexGrow: `1`,
            width: `100%`,
            [breakpoint2Columns]: {
              width: `auto`,
              maxWidth: 480,
            },
            [mediaQueries.lg]: {
              maxWidth: 560,
            },
          }}
        >
          <Img
            alt={`${creator.name}`}
            sx={{ borderRadius: 1 }}
            fluid={creator.image.childImageSharp.fluid}
          />
        </div>
        <div
          sx={{
            m: 6,
            flex: `1`,
            width: `100%`,
            [mediaQueries.lg]: {
              width: `auto`,
              maxWidth: 640,
            },
          }}
        >
          <h1 sx={{ m: 0 }}>{creator.name}</h1>
          <div
            css={{
              alignItems: `center`,
              display: `flex`,
              mt: 3,
            }}
          >
            {isAgencyOrCompany && (
              <span
                sx={{
                  color: `textMuted`,
                  mr: 2,
                }}
              >
                {creator.type.charAt(0).toUpperCase() + creator.type.slice(1)}
              </span>
            )}

            {creator.for_hire || creator.hiring ? (
              <div
                sx={{
                  alignSelf: `flex-start`,
                  fontSize: 1,
                  mr: 2,
                }}
              >
                <Badge
                  forHire={creator.for_hire}
                  overrideCSS={{
                    background: `green.50`,
                    color: `white`,
                  }}
                >
                  {creator.for_hire ? `Open for work` : `Hiring`}
                </Badge>
              </div>
            ) : null}
            {creator.github && (
              <a
                href={creator.github}
                sx={{
                  "& svg": { display: `block` },
                  "&&": {
                    border: 0,
                    lineHeight: `solid`,
                    "&:hover": {
                      color: `gatsby`,
                    },
                  },
                }}
              >
                <GithubIcon />
              </a>
            )}
          </div>
          <div sx={{ py: 6 }}>{creator.description}</div>
          <MetaSection first>
            <MetaTitle>Get in touch</MetaTitle>
            <a href={creator.website} target="_blank" rel="noopener noreferrer">
              {removeProtocol(creator.website)}
            </a>
          </MetaSection>
          <MetaSection>
            <MetaTitle>From</MetaTitle>
            <p sx={{ m: 0 }}>{creator.location}</p>
          </MetaSection>
          {creator.portfolio === true && sites.length > 0 && (
            <MetaSection background="transparent" last>
              <MetaTitle>Worked On</MetaTitle>
              <div
                css={{
                  display: `flex`,
                  alignItems: `flex-start`,
                  flexWrap: `wrap`,
                }}
              >
                {sites.map(site => (
                  <Link
                    key={site.title}
                    sx={{
                      "&&": {
                        mr: 6,
                        mb: 6,
                        borderBottom: `none`,
                        lineHeight: 0,
                        transition: `default`,
                      },
                    }}
                    to={site.fields.slug}
                  >
                    <Img
                      alt={`${site.title}`}
                      fixed={
                        site.childScreenshot.screenshotFile.childImageSharp
                          .fixed
                      }
                    />
                  </Link>
                ))}
              </div>
            </MetaSection>
          )}
        </div>
      </main>
      <FooterLinks />
    </React.Fragment>
  )
}

export const pageQuery = graphql`
  query($slug: String!, $name: String!) {
    creatorsYaml(fields: { slug: { eq: $slug } }) {
      name
      description
      location
      website
      github
      image {
        childImageSharp {
          fluid {
            ...GatsbyImageSharpFluid
          }
        }
      }
      for_hire
      hiring
      portfolio
      type
      fields {
        slug
      }
    }
    allSitesYaml(
      filter: {
        built_by: { eq: $name }
        fields: { hasScreenshot: { eq: true } }
      }
    ) {
      nodes {
        url
        title
        childScreenshot {
          screenshotFile {
            childImageSharp {
              fixed(width: 100, height: 100) {
                ...GatsbyImageSharpFixed
              }
            }
          }
        }
        fields {
          slug
        }
      }
    }
  }
`
