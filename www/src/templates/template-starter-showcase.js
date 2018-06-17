import React from "react"
import Helmet from "react-helmet"
// import { Link } from "gatsby"
// import { OutboundLink } from "gatsby-plugin-google-analytics"

import url from "url"
// import hex2rgba from "hex2rgba"
import Layout from "../components/layout"
import ShareMenu from "../components/share-menu-starters"
import presets, { colors } from "../utils/presets"
import /*typography, */ { rhythm, scale, options } from "../utils/typography"
// import Container from "../components/container"
import MdLaunch from "react-icons/lib/md/launch"

const cleanUrl = mainUrl => {
  const parsed = url.parse(mainUrl)
  let path = parsed.pathname
  if (path[path.length - 1] === `/`) path = path.slice(0, path.length - 1)
  return parsed.hostname + path
}

const gutter = rhythm(3 / 4)
const gutterDesktop = rhythm(6 / 4)

class StarterTemplate extends React.Component {
  render() {

    const { data } = this.props
    const { markdownRemark } = data
    const { fields,
      // frontmatter
    } = markdownRemark
    const isModal = false
    return (
      <Layout
        location={this.props.location}
        isModal={isModal}
        modalBackgroundPath="/showcase"
      >
        <div
          css={{
            alignItems: `center`,
            display: `flex`,
            flexDirection: `column`,
            maxWidth: isModal ? false : 1080,
            margin: isModal ? false : `0 auto`,
          }}
        >
          <div
            css={{
              width: `100%`,
            }}
          >
            <Helmet>
              <title>{fields.githubFullName}</title>
              {/* <meta
                name="og:image"
                content={`https://next.gatsbyjs.org${
                  markdownRemark.childScreenshot.screenshotFile.childImageSharp
                    .resize.src
                }`}
              />
              <meta
                name="twitter:image"
                content={`https://next.gatsbyjs.org${
                  markdownRemark.childScreenshot.screenshotFile.childImageSharp
                    .resize.src
                }`}
              /> */}
            </Helmet>
            <div
              css={{
                fontFamily: options.headerFontFamily.join(`,`),
                padding: gutter,
                paddingBottom: rhythm(1.5 / 4),
                [presets.Desktop]: {
                  padding: gutterDesktop,
                  paddingBottom: rhythm(3 / 4),
                },
              }}
            >
              <h1 css={{ margin: 0 }}>{markdownRemark.title}</h1>
              <a
                href={markdownRemark.main_url}
                css={{
                  ...styles.link,
                  fontWeight: `bold`,
                  [presets.Desktop]: {
                    ...scale(-1 / 6),
                  },
                }}
              >
                {/* {cleanUrl(markdownRemark.main_url)} */}
                cleanUrl(markdownRemark.main_url)
              </a>

              {markdownRemark.built_by && (
                <span
                  css={{
                    color: colors.gray.calm,
                    [presets.Desktop]: {
                      ...scale(-1 / 6),
                    },
                  }}
                >
                  {` `}
                  <span css={{ paddingRight: 8, paddingLeft: 8 }}>/</span>
                  {` `}
                  Built by{` `}
                  {markdownRemark.built_by_url ? (
                    <a
                      href={markdownRemark.built_by_url}
                      css={{
                        ...styles.link,
                        fontWeight: `bold`,
                      }}
                    >
                      {markdownRemark.built_by}
                    </a>
                  ) : (
                      markdownRemark.built_by
                    )}
                </span>
              )}
            </div>
            <div
              css={{
                display: `flex`,
                borderTop: `1px solid ${colors.ui.light}`,
                fontFamily: options.headerFontFamily.join(`,`),
                margin: `0 ${gutter}`,
                [presets.Desktop]: {
                  margin: `0 ${gutterDesktop}`,
                },
              }}
            >
              {markdownRemark.featured && (
                <div
                  css={{
                    borderRight: `1px solid ${colors.ui.light}`,
                    color: colors.gatsby,
                    display: `flex`,
                    fontWeight: `bold`,
                    padding: 20,
                    paddingLeft: 0,
                    [presets.Desktop]: {
                      ...scale(-1 / 6),
                    },
                  }}
                >
                  {/* <img
                    src={FeaturedIcon}
                    alt="icon"
                    css={{ marginBottom: 0, marginRight: 10 }}
                  /> */}
                  Featured
                </div>
              )}
              {markdownRemark.source_url && (
                <div
                  css={{
                    padding: 20,
                    paddingLeft: markdownRemark.featured ? false : 0,
                    display: `flex`,
                    borderRight: `1px solid ${colors.ui.light}`,
                    [presets.Desktop]: {
                      ...scale(-1 / 6),
                    },
                  }}
                >
                  {/* <img
                    src={GithubIcon}
                    alt="icon"
                    css={{ marginBottom: 0, marginRight: 10 }}
                  /> */}
                  <a href={markdownRemark.source_url} css={{ ...styles.link }}>
                    Source
                  </a>
                </div>
              )}
              {false && ( // TODO: NOT IMPLEMENTED YET!!!
                <div
                  css={{
                    padding: 20,
                    display: `flex`,
                    borderRight: `1px solid ${colors.ui.light}`,
                  }}
                >
                  {/* <img
                    src={FeatherIcon}
                    alt="icon"
                    css={{ marginBottom: 0, marginRight: 10 }}
                  /> */}
                  <a href={markdownRemark.source_url}>Case Study</a>
                </div>
              )}
            </div>
            <div
              css={{
                borderTop: `1px solid ${colors.ui.light}`,
                position: `relative`,
              }}
            >
              <div
                css={{
                  position: `absolute`,
                  right: gutter,
                  top: gutter,
                  left: `auto`,
                  zIndex: 1,
                  display: `flex`,
                }}
              >
                <a
                  href={markdownRemark.main_url}
                  css={{
                    border: 0,
                    borderRadius: presets.radius,
                    color: colors.gatsby,
                    fontFamily: options.headerFontFamily.join(`,`),
                    fontWeight: `bold`,
                    marginRight: rhythm(1.5 / 4),
                    padding: `${rhythm(1 / 5)} ${rhythm(2 / 3)}`,
                    textDecoration: `none`,
                    WebkitFontSmoothing: `antialiased`,
                    "&&": {
                      backgroundColor: colors.gatsby,
                      borderBottom: `none`,
                      boxShadow: `none`,
                      color: `white`,
                      "&:hover": {
                        backgroundColor: colors.gatsby,
                      },
                    },
                  }}
                >
                  <MdLaunch style={{ verticalAlign: `sub` }} /> Visit site
                </a>
                <ShareMenu
                  url={markdownRemark.main_url}
                  title={markdownRemark.title}
                // image={`https://next.gatsbyjs.org${
                //   markdownRemark.childScreenshot.screenshotFile
                //     .childImageSharp.resize.src
                //   }`}
                />
              </div>
              {/* <Img
                sizes={
                  markdownRemark.childScreenshot.screenshotFile.childImageSharp
                    .sizes
                }
                alt={`Screenshot of ${markdownRemark.title}`}
                css={{
                  boxShadow: isModal
                    ? false
                    : `0 4px 10px ${hex2rgba(colors.gatsby, 0.1)}`,
                }}
              /> */}
              Img
            </div>
            <div
              css={{
                padding: gutter,
                [presets.Desktop]: {
                  padding: gutterDesktop,
                },
              }}
            >
              <p>{markdownRemark.description}</p>
              <div
                css={{
                  display: `flex`,
                  fontFamily: options.headerFontFamily.join(`,`),
                }}
              >
                <div css={{ color: colors.gray.calm, paddingRight: 20 }}>
                  Categories
                </div>
                {/* <div>{categories.join(`, `)}</div> */}
                <div>categories</div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    )
  }
}


export default StarterTemplate

export const pageQuery = graphql`
  query TemplateStarter($slug: String!) {
    markdownRemark(fields: {
        starterShowcase: {
          slug: { eq: $slug }
        }
      }) {
        frontmatter {
          date
          demo
          repo
          tags
          features
          description
        }
        fields {
          starterShowcase {
            stub
            slug
            date
            gatsbyDependencies
            lastUpdated
            description
            githubFullName
            owner {
              avatar_url
            }
            githubData {
              repoMetadata {
                full_name
                name
                owner {
                  login
                }
              }
            }
            stars
          }
        }
    }
  }
`


const styles = {
  link: {
    color: colors.gatsby,
    textDecoration: `none`,
  },
  prevNextLink: {
    color: colors.lilac,
    fontFamily: options.headerFontFamily.join(`,`),
    position: `absolute`,
    top: 280,
    width: 300,
    transform: `translateX(-75px) rotate(90deg)`,
    [presets.Desktop]: {
      ...scale(-1 / 6),
    },
  },
  prevNextLinkSiteTitle: {
    color: colors.gatsby,
    fontWeight: `bold`,
  },
  prevNextImage: {
    borderRadius: presets.radius,
    boxShadow: `0 0 38px -8px ${colors.gatsby}`,
  },
  prevNextPermalinkLabel: {
    color: colors.gray.calm,
    fontFamily: options.headerFontFamily.join(`,`),
    fontWeight: `normal`,
  },
  prevNextPermalinkImage: {
    marginBottom: 0,
    marginTop: rhythm(options.blockMarginBottom),
  },
  prevNextPermalinkTitle: {
    color: colors.gatsby,
    display: `block`,
    position: `relative`,
  },
  prevNextPermalinkContainer: {
    width: `50%`,
  },
  truncate: {
    whiteSpace: `nowrap`,
    overflow: `hidden`,
    textOverflow: `ellipsis`,
    display: `block`,
    width: `100%`,
  },
  prevNextPermalinkArrow: {
    color: colors.lilac,
    marginRight: 4,
    verticalAlign: `sub`,
    position: `absolute`,
    left: `-${rhythm(3 / 4)}`,
    top: `50%`,
    transform: `translateY(-50%)`,
  },
  prevNextPermalinkMeta: {
    marginLeft: rhythm(6 / 4),
    display: `flex`,
    flexDirection: `row`,
    justifyContent: `flex-end`,
  },
  prevNextPermalinkMetaInner: {
    flexBasis: 540,
    flexGrow: 0,
    flexShrink: 1,
    minWidth: 0,
  },
}
