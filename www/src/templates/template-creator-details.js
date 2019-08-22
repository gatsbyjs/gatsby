import React, { Component } from "react"
import { graphql, Link } from "gatsby"
import Layout from "../components/layout"
import { Helmet } from "react-helmet"
import { rhythm } from "../utils/typography"
import Img from "gatsby-image"
import CreatorsHeader from "../views/creators/creators-header"
import Badge from "../views/creators/badge"
import FooterLinks from "../components/shared/footer-links"
import {
  colors,
  space,
  transition,
  radii,
  mediaQueries,
  fontSizes,
  lineHeights,
} from "../utils/presets"
import GithubIcon from "react-icons/lib/go/mark-github"

const removeProtocol = input => input.replace(/^https?:\/\//, ``)

const breakpoint2Columns = mediaQueries.md

const MetaTitle = ({ children }) => (
  <p
    css={{
      margin: `0`,
      color: colors.text.secondary,
      marginBottom: space[1],
      flexShrink: 0,
      [mediaQueries.xs]: {
        width: 150,
      },
      [breakpoint2Columns]: {
        fontWeight: `600`,
        marginBottom: 0,
        textTransform: `none`,
      },
    }}
  >
    {children}
  </p>
)

const MetaSection = ({ children, background, last, first }) => (
  <div
    css={{
      background: background ? background : colors.ui.background,
      marginLeft: `-${space[5]}`,
      marginRight: `-${space[5]}`,
      padding: space[5],
      borderTop: first ? `1px solid ${colors.ui.border.subtle}` : null,
      borderBottom: last ? null : `1px solid ${colors.ui.border.subtle}`,
      [breakpoint2Columns]: {
        background: `transparent`,
        paddingLeft: 0,
        paddingRight: 0,
        marginLeft: 0,
        marginRight: 0,
      },
      [mediaQueries.sm]: {
        display: `flex`,
      },
    }}
  >
    {children}
  </div>
)

class CreatorTemplate extends Component {
  render() {
    const { data, location } = this.props
    const creator = data.creatorsYaml
    const isAgencyOrCompany =
      creator.type === `agency` || creator.type === `company`

    let sites = []
    data.allSitesYaml.edges.map(site => {
      if (site.node.built_by === creator.name) {
        sites.push(site)
      }
    })

    return (
      <Layout location={location}>
        <Helmet>
          <title>{`${creator.name} - Creator`}</title>
        </Helmet>
        <CreatorsHeader submissionText="Add Yourself" />
        <main
          role="main"
          css={{
            padding: space[6],
            paddingBottom: `10vh`,
            display: `flex`,
            flexDirection: `column`,
            alignItems: `center`,
            justifyContent: `center`,
            width: `100%`,
            [breakpoint2Columns]: {
              paddingBottom: space[6],
              flexDirection: `row`,
              alignItems: `flex-start`,
            },
          }}
        >
          <div
            css={{
              margin: space[6],
              marginBottom: space[1],
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
              css={{ borderRadius: radii[1] }}
              fluid={creator.image.childImageSharp.fluid}
            />
          </div>
          <div
            css={{
              margin: space[6],
              flex: `1`,
              width: `100%`,
              [mediaQueries.lg]: {
                width: `auto`,
                maxWidth: 640,
              },
            }}
          >
            <h1
              css={{
                margin: `0`,
              }}
            >
              {creator.name}
            </h1>
            <div
              css={{
                alignItems: `center`,
                display: `flex`,
                marginTop: space[3],
              }}
            >
              {isAgencyOrCompany && (
                <span
                  css={{
                    color: colors.text.secondary,
                    marginRight: space[2],
                  }}
                >
                  {creator.type.charAt(0).toUpperCase() + creator.type.slice(1)}
                </span>
              )}

              {creator.for_hire || creator.hiring ? (
                <div
                  css={{
                    alignSelf: `flex-start`,
                    fontSize: fontSizes[1],
                    marginRight: space[2],
                  }}
                >
                  <Badge
                    forHire={creator.for_hire}
                    customCSS={{
                      background: colors.green[50],
                      color: colors.white,
                    }}
                  >
                    {creator.for_hire ? `Open for work` : `Hiring`}
                  </Badge>
                </div>
              ) : null}
              {creator.github && (
                <a
                  href={creator.github}
                  css={{
                    "& svg": { display: `block` },
                    "&&": {
                      border: 0,
                      lineHeight: lineHeights.solid,
                      "&:hover": {
                        color: colors.gatsby,
                      },
                    },
                  }}
                >
                  <GithubIcon />
                </a>
              )}
            </div>
            <div
              css={{
                padding: `${rhythm()} 0`,
              }}
            >
              {creator.description}
            </div>
            <MetaSection first>
              <MetaTitle>Get in touch</MetaTitle>
              <a
                href={creator.website}
                target="_blank"
                rel="noopener noreferrer"
              >
                {removeProtocol(creator.website)}
              </a>
            </MetaSection>
            <MetaSection>
              <MetaTitle>From</MetaTitle>
              <p
                css={{
                  margin: `0`,
                }}
              >
                {creator.location}
              </p>
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
                      key={site.node.title}
                      css={{
                        "&&": {
                          marginRight: space[6],
                          marginBottom: space[6],
                          borderBottom: `none`,
                          lineHeight: 0,
                          transition: `all ${transition.speed.default} ${transition.curve.default}`,
                        },
                      }}
                      to={site.node.fields.slug}
                    >
                      <Img
                        alt={`${site.node.title}`}
                        fixed={
                          site.node.childScreenshot.screenshotFile
                            .childImageSharp.fixed
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
      </Layout>
    )
  }
}

export default CreatorTemplate

export const pageQuery = graphql`
  query($slug: String!) {
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
    allSitesYaml(filter: { fields: { hasScreenshot: { eq: true } } }) {
      edges {
        node {
          built_by
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
  }
`
