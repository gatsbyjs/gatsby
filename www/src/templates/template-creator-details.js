import React, { Component } from "react"
import { graphql, Link } from "gatsby"
import Layout from "../components/layout"
import { Helmet } from "react-helmet"
import { rhythm, scale, options } from "../utils/typography"
import Img from "gatsby-image"
import CreatorsHeader from "../views/creators/creators-header"
import Badge from "../views/creators/badge"
import presets, { colors, space } from "../utils/presets"
import GithubIcon from "react-icons/lib/go/mark-github"

const removeProtocol = input => input.replace(/^https?:\/\//, ``)

const breakpoint2Columns = presets.Md

const MetaTitle = ({ children }) => (
  <p
    css={{
      margin: `0`,
      color: colors.gray.calm,
      marginBottom: rhythm(options.blockMarginBottom / 4),
      [presets.Xs]: {
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
      background: background ? background : colors.ui.whisper,
      marginLeft: rhythm(-scale[1]),
      marginRight: rhythm(-scale[1]),
      padding: rhythm(scale[1]),
      borderTop: first ? `1px solid ${colors.ui.light}` : null,
      borderBottom: last ? null : `1px solid ${colors.ui.light}`,
      [breakpoint2Columns]: {
        background: `transparent`,
        paddingLeft: 0,
        paddingRight: 0,
        marginLeft: 0,
        marginRight: 0,
      },
      [presets.Sm]: {
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
          <title>{creator.name}</title>
        </Helmet>
        <CreatorsHeader submissionText="Add Yourself" />
        <main
          role="main"
          css={{
            padding: rhythm(space[6]),
            paddingBottom: `10vh`,
            display: `flex`,
            flexDirection: `column`,
            alignItems: `center`,
            justifyContent: `center`,
            width: `100%`,
            [breakpoint2Columns]: {
              paddingBottom: rhythm(space[6]),
              flexDirection: `row`,
              alignItems: `flex-start`,
            },
          }}
        >
          <div
            css={{
              margin: rhythm(space[6]),
              marginBottom: rhythm(options.blockMarginBottom / 4),
              flexGrow: `1`,
              width: `100%`,
              [breakpoint2Columns]: {
                width: `auto`,
                maxWidth: 480,
              },
              [presets.Lg]: {
                maxWidth: 560,
              },
            }}
          >
            <Img
              alt={`${creator.name}`}
              css={{ borderRadius: presets.radii[1] }}
              fluid={creator.image.childImageSharp.fluid}
            />
          </div>
          <div
            css={{
              margin: rhythm(space[6]),
              flex: `1`,
              width: `100%`,
              [presets.Lg]: {
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
                marginTop: rhythm(options.blockMarginBottom / 2),
              }}
            >
              {isAgencyOrCompany && (
                <span
                  css={{
                    color: colors.gray.calm,
                    marginRight: `.5rem`,
                  }}
                >
                  {creator.type.charAt(0).toUpperCase() + creator.type.slice(1)}
                </span>
              )}

              {creator.for_hire || creator.hiring ? (
                <div
                  css={{
                    alignSelf: `flex-start`,
                    fontSize: presets.scale[1],
                    marginRight: `.5rem`,
                  }}
                >
                  <Badge
                    forHire={creator.for_hire}
                    customCSS={{
                      background: colors.success,
                      color: `#fff`,
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
                      boxShadow: `none`,
                      lineHeight: presets.lineHeights.solid,
                      "&:hover": {
                        background: `none`,
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
                  }}
                >
                  {sites.map(site => (
                    <Link
                      key={site.node.title}
                      css={{
                        "&&": {
                          marginRight: rhythm(space[6]),
                          borderBottom: `none`,
                          boxShadow: `none`,
                          transition: `all ${presets.animation.speedDefault} ${
                            presets.animation.curveDefault
                          }`,
                          "&:hover": {
                            background: `none`,
                          },
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
