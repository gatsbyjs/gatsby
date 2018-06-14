import React from "react"
import Helmet from "react-helmet"
import url from "url"

import presets, { colors } from "../utils/presets"
import { options, scale } from "../utils/typography"
import { navigateTo, Link } from "gatsby"
import Layout from "../components/layout"

import Img from "gatsby-image"

import MdArrowUpward from "react-icons/lib/md/arrow-upward"
import FeaturedIcon from "../assets/featured-detailpage-featuredicon.svg"
import FeatherIcon from "../assets/showcase-feather.svg"
import GithubIcon from "../assets/showcase-github.svg"

const cleanUrl = mainUrl => {
  const parsed = url.parse(mainUrl)
  let path = parsed.pathname
  if (path[path.length - 1] === `/`) path = path.slice(0, path.length - 1)
  return parsed.hostname + path
}

const gutter = 40

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
            </Helmet>
            <div
              css={{
                borderBottom: `1px solid #F5F3F7`,
                fontFamily: options.headerFontFamily.join(`,`),
                padding: gutter,
                paddingBottom: gutter / 2,
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
                borderBottom: `1px solid #F5F3F7`,
                fontFamily: options.headerFontFamily.join(`,`),
              }}
            >
              {data.sitesYaml.featured && (
                <div
                  css={{
                    borderRight: `1px solid #F5F3F7`,
                    color: colors.gatsby,
                    display: `flex`,
                    fontWeight: `bold`,
                    padding: 20,
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
                    display: `flex`,
                    borderRight: `1px solid #F5F3F7`,
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
                    borderRight: `1px solid #F5F3F7`,
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
            <Img
              sizes={
                data.sitesYaml.childScreenshot.screenshotFile.childImageSharp
                  .sizes
              }
              alt={`Screenshot of ${data.sitesYaml.title}`}
            />
            <div
              css={{
                padding: gutter,
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

// TODO: the image dimensions here are 100x100, but the design calls for much larger. do we do it?
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
          display: `flex`,
          borderTop: `1px solid #F5F3F7`,
          padding: 50,
          paddingTop: 15,
        }}
      >
        <div css={{ flex: 1 }}>
          <div css={{ color: `#9B9B9B` }}>Previous</div>
          <div css={{ padding: `20px 0px` }}>
            <Link
              to={{
                pathname: previousSite.fields.slug,
                state: { isModal: false },
              }}
            >
              ← {previousSite.title}
            </Link>
          </div>
          <Img
            css={{
              boxShadow: `0px 0px 38px -8px ${colors.gatsby}`,
              width: `100%`,
              height: `100%`,
            }}
            resolutions={
              previousSite.childScreenshot.screenshotFile.childImageSharp
                .resolutions
            }
            alt=""
          />
        </div>
        <div css={{ flex: 1 }}>
          <div css={{ color: `#9B9B9B` }}>Next</div>
          <div css={{ padding: `20px 0px` }}>
            <Link
              to={{ pathname: nextSite.fields.slug, state: { isModal: false } }}
            >
              {nextSite.title} →
            </Link>
          </div>
          <Img
            css={{
              boxShadow: `0px 0px 38px -8px ${colors.gatsby}`,
              width: `100%`,
              height: `100%`,
            }}
            resolutions={
              nextSite.childScreenshot.screenshotFile.childImageSharp
                .resolutions
            }
            alt=""
          />
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
    top: `280px`,
    width: `300px`,
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
    boxShadow: `0px 0px 38px -8px ${colors.gatsby}`,
  },
}
