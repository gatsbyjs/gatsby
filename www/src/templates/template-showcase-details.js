import React from "react"
import Helmet from "react-helmet"
import url from "url"
import hex2rgba from "hex2rgba"

import presets, { colors } from "../utils/presets"
import { options, scale, rhythm } from "../utils/typography"
import { navigateTo, Link } from "gatsby"
import Layout from "../components/layout"
import ShareMenu from "../components/share-menu"

import Img from "gatsby-image"

import MdArrowUpward from "react-icons/lib/md/arrow-upward"
import MdArrowForward from "react-icons/lib/md/arrow-forward"
import MdArrowBack from "react-icons/lib/md/arrow-back"
import MdLaunch from "react-icons/lib/md/launch"
import FeaturedIcon from "../assets/featured-detailpage-featuredicon.svg"
import FeatherIcon from "../assets/showcase-feather.svg"
import GithubIcon from "../assets/showcase-github.svg"

const cleanUrl = mainUrl => {
  const parsed = url.parse(mainUrl)
  let path = parsed.pathname
  if (path[path.length - 1] === `/`) path = path.slice(0, path.length - 1)
  return parsed.hostname + path
}

const gutter = rhythm(3 / 4)
const gutterDesktop = rhythm(6 / 4)

class ShowcaseTemplate extends React.Component {
  findCurrentIndex() {
    const {
      data: { allSitesYaml },
    } = this.props
    for (let i = 0; i < allSitesYaml.edges.length; i++) {
      const site = allSitesYaml.edges[i].node
      if (site.fields.slug === this.props.location.pathname) {
        return i
      }
    }

    return 0
  }

  getNext() {
    const {
      data: { allSitesYaml },
    } = this.props

    const currentIndex = this.findCurrentIndex()
    return allSitesYaml.edges[(currentIndex + 1) % allSitesYaml.edges.length]
      .node
  }

  next = () => {
    const { location } = this.props

    const nextSite = this.getNext()

    navigateTo({
      pathname: nextSite.fields.slug,
      state: {
        isModal: location.state.isModal,
      },
    })
  }

  getPrevious() {
    const {
      data: { allSitesYaml },
    } = this.props

    const currentIndex = this.findCurrentIndex()
    let index = currentIndex - 1
    if (index < 0) index = allSitesYaml.edges.length - 1
    return allSitesYaml.edges[index].node
  }

  previous = () => {
    const { location } = this.props

    const previousSite = this.getPrevious()
    navigateTo({
      pathname: previousSite.fields.slug,
      state: {
        isModal: location.state.isModal,
      },
    })
  }

  UNSAFE_componentWillMount() {}

  render() {
    const { data } = this.props

    const isModal =
      this.props.location.state && this.props.location.state.isModal

    const nextSite = this.getNext()
    const previousSite = this.getPrevious()

    const categories = data.sitesYaml.categories || []

    return (
      <Layout
        location={this.props.location}
        isModal={isModal}
        modalBackgroundPath="/showcase"
        modalNext={this.next}
        modalPrevious={this.previous}
        modalNextLink={
          <Link
            to={{ pathname: nextSite.fields.slug, state: { isModal: true } }}
            css={{
              display: `block`,
              position: `fixed`,
              top: `150px`,
              transform: `translateX(750px)`,
            }}
          >
            <div
              css={{
                margin: `25px`,
              }}
            >
              <Img
                css={{
                  ...styles.prevNextImage,
                }}
                resolutions={
                  nextSite.childScreenshot.screenshotFile.childImageSharp
                    .resolutions
                }
                alt=""
              />
            </div>
            <div
              css={{
                ...styles.prevNextLink,
              }}
            >
              <MdArrowUpward />
              <div>Next Site in Showcase</div>
              <div css={{ ...styles.prevNextLinkSiteTitle }}>
                {nextSite.title}
              </div>
            </div>
          </Link>
        }
        modalPreviousLink={
          <Link
            to={{
              pathname: previousSite.fields.slug,
              state: { isModal: true },
            }}
            css={{
              display: `block`,
              position: `fixed`,
              top: `150px`,
              transform: `translateX(-100%)`,
            }}
          >
            <div
              css={{
                margin: `25px`,
              }}
            >
              <Img
                css={{
                  ...styles.prevNextImage,
                }}
                resolutions={
                  previousSite.childScreenshot.screenshotFile.childImageSharp
                    .resolutions
                }
                alt=""
              />
            </div>
            <div
              css={{
                ...styles.prevNextLink,
                transform: `translateX(-75px) rotate(-90deg)`,
                textAlign: `right`,
              }}
            >
              <MdArrowUpward />
              <div>Previous Site in Showcase</div>
              <div css={{ ...styles.prevNextLinkSiteTitle }}>
                {previousSite.title}
              </div>
            </div>
          </Link>
        }
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
              <title>{data.sitesYaml.title}</title>
              <meta
                name="og:image"
                content={`https://next.gatsbyjs.org${
                  data.sitesYaml.childScreenshot.screenshotFile.childImageSharp
                    .resize.src
                }`}
              />
              <meta
                name="twitter:image"
                content={`https://next.gatsbyjs.org${
                  data.sitesYaml.childScreenshot.screenshotFile.childImageSharp
                    .resize.src
                }`}
              />
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
              <h1 css={{ margin: 0 }}>{data.sitesYaml.title}</h1>
              <a
                href={data.sitesYaml.main_url}
                css={{
                  ...styles.link,
                  fontWeight: `bold`,
                  [presets.Desktop]: {
                    ...scale(-1 / 6),
                  },
                }}
              >
                {cleanUrl(data.sitesYaml.main_url)}
              </a>

              {data.sitesYaml.built_by && (
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
                  {data.sitesYaml.built_by_url ? (
                    <a
                      href={data.sitesYaml.built_by_url}
                      css={{
                        ...styles.link,
                        fontWeight: `bold`,
                      }}
                    >
                      {data.sitesYaml.built_by}
                    </a>
                  ) : (
                    data.sitesYaml.built_by
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
              {data.sitesYaml.featured && (
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
                  <img
                    src={FeaturedIcon}
                    alt="icon"
                    css={{ marginBottom: 0, marginRight: 10 }}
                  />
                  Featured
                </div>
              )}
              {data.sitesYaml.source_url && (
                <div
                  css={{
                    padding: 20,
                    paddingLeft: data.sitesYaml.featured ? false : 0,
                    display: `flex`,
                    borderRight: `1px solid ${colors.ui.light}`,
                    [presets.Desktop]: {
                      ...scale(-1 / 6),
                    },
                  }}
                >
                  <img
                    src={GithubIcon}
                    alt="icon"
                    css={{ marginBottom: 0, marginRight: 10 }}
                  />
                  <a href={data.sitesYaml.source_url} css={{ ...styles.link }}>
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
                  <img
                    src={FeatherIcon}
                    alt="icon"
                    css={{ marginBottom: 0, marginRight: 10 }}
                  />
                  <a href={data.sitesYaml.source_url}>Case Study</a>
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
                  href={data.sitesYaml.main_url}
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
                  url={data.sitesYaml.main_url}
                  title={data.sitesYaml.title}
                  image={`https://next.gatsbyjs.org${
                    data.sitesYaml.childScreenshot.screenshotFile
                      .childImageSharp.resize.src
                  }`}
                />
              </div>
              <Img
                sizes={
                  data.sitesYaml.childScreenshot.screenshotFile.childImageSharp
                    .sizes
                }
                alt={`Screenshot of ${data.sitesYaml.title}`}
                css={{
                  boxShadow: isModal
                    ? false
                    : `0 4px 10px ${hex2rgba(colors.gatsby, 0.1)}`,
                }}
              />
            </div>
            <div
              css={{
                padding: gutter,
                [presets.Desktop]: {
                  padding: gutterDesktop,
                },
              }}
            >
              <p>{data.sitesYaml.description}</p>
              <div
                css={{
                  display: `flex`,
                  fontFamily: options.headerFontFamily.join(`,`),
                }}
              >
                <div css={{ color: colors.gray.calm, paddingRight: 20 }}>
                  Categories
                </div>
                <div>{categories.join(`, `)}</div>
              </div>
            </div>
          </div>
        </div>
        <PermalinkPageFooter
          nextSite={nextSite}
          previousSite={previousSite}
          isModal={isModal}
        />
      </Layout>
    )
  }
}

export default ShowcaseTemplate

class PermalinkPageFooter extends React.Component {
  state = {
    windowWidth: null,
  }

  componentDidMount() {
    this.setState({ windowWidth: window.innerWidth })
  }

  render() {
    const { nextSite, previousSite, isModal } = this.props

    if (isModal && this.state.windowWidth > 750) return null
    return (
      <div
        css={{
          borderTop: `1px solid ${colors.ui.light}`,
          display: `flex`,
          paddingTop: rhythm(options.blockMarginBottom * 2),
          paddingBottom: 58,
          [presets.Tablet]: {
            paddingBottom: 0,
          },
        }}
      >
        <div css={{ ...styles.prevNextPermalinkContainer }}>
          <Link
            to={{
              pathname: previousSite.fields.slug,
              state: { isModal: false },
            }}
          >
            <div css={{ ...styles.prevNextPermalinkMeta }}>
              <div css={{ ...styles.prevNextPermalinkMetaInner }}>
                <div css={{ ...styles.prevNextPermalinkLabel }}>Previous</div>
                <div css={{ ...styles.prevNextPermalinkTitle }}>
                  <MdArrowBack style={{ ...styles.prevNextPermalinkArrow }} />
                  <span css={{ ...styles.truncate }}>{previousSite.title}</span>
                </div>
              </div>
            </div>
            <Img
              sizes={
                previousSite.childScreenshot.screenshotFile.childImageSharp
                  .sizes
              }
              alt=""
              style={{ ...styles.prevNextPermalinkImage }}
            />
          </Link>
        </div>
        <div css={{ ...styles.prevNextPermalinkContainer }}>
          <Link
            to={{ pathname: nextSite.fields.slug, state: { isModal: false } }}
          >
            <div
              css={{
                marginLeft: rhythm(6 / 4),
                marginRight: rhythm(6 / 4),
              }}
            >
              <div css={{ ...styles.prevNextPermalinkLabel }}>Next</div>
              <div css={{ ...styles.prevNextPermalinkTitle }}>
                <span css={{ ...styles.truncate }}>{nextSite.title}</span>
                <MdArrowForward style={{ ...styles.prevNextPermalinkArrow }} />
              </div>
            </div>
            <Img
              sizes={
                nextSite.childScreenshot.screenshotFile.childImageSharp.sizes
              }
              alt=""
              style={{
                ...styles.prevNextPermalinkImage,
              }}
            />
          </Link>
        </div>
      </div>
    )
  }
}

export const pageQuery = graphql`
  query TemplateShowcasePage($slug: String!) {
    sitesYaml(fields: { slug: { eq: $slug } }) {
      id
      title
      main_url
      featured
      categories
      built_by
      built_by_url
      source_url
      description
      childScreenshot {
        screenshotFile {
          childImageSharp {
            resolutions(width: 750, height: 563) {
              ...GatsbyImageSharpResolutions
            }
            sizes(maxWidth: 700) {
              ...GatsbyImageSharpSizes
            }
            resize(
              width: 1500
              height: 1500
              cropFocus: CENTER
              toFormat: JPG
            ) {
              src
            }
          }
        }
      }
      fields {
        slug
      }
    }

    allSitesYaml(filter: { fields: { slug: { ne: null } } }) {
      edges {
        node {
          title
          fields {
            slug
          }
          childScreenshot {
            screenshotFile {
              childImageSharp {
                resolutions(width: 100, height: 100) {
                  ...GatsbyImageSharpResolutions
                }
                sizes(maxWidth: 800, maxHeight: 800) {
                  ...GatsbyImageSharpSizes
                }
              }
            }
          }
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
