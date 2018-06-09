import React from "react"
import Helmet from "react-helmet"
import url from "url"

import { colors } from "../utils/presets"
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

  componentWillMount() {}

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
                  boxShadow: `0px 0px 38px -8px ${colors.gatsby}`,
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
                position: `absolute`,
                top: `280px`,
                width: `300px`,
                color: colors.gatsby,
                transform: `translateX(-75px) rotate(90deg)`,
              }}
            >
              <MdArrowUpward />
              <div>Next Site in Showcase</div>
              <div css={{ fontWeight: `bold` }}>{nextSite.title}</div>
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
                  boxShadow: `0px 0px 90px -24px ${colors.gatsby}`,
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
                position: `absolute`,
                top: `280px`,
                width: `300px`,
                color: colors.gatsby,
                transform: `translateX(-75px) rotate(-90deg)`,
                textAlign: `right`,
              }}
            >
              <MdArrowUpward />
              <div>Previous Site in Showcase</div>
              <div css={{ fontWeight: `bold` }}>{previousSite.title}</div>
            </div>
          </Link>
        }
      >
        <div
          css={{
            display: `flex`,
            flexDirection: `column`,
            alignItems: `center`,
          }}
        >
          <div>
            <Helmet>
              <title>{data.sitesYaml.title}</title>
            </Helmet>
            <div
              css={{
                padding: `20px`,
                paddingTop: `1px`,
                borderBottom: `1px solid #F5F3F7`,
                paddingBottom: 15,
              }}
            >
              <h1>{data.sitesYaml.title}</h1>
              <a href={data.sitesYaml.main_url}>
                {cleanUrl(data.sitesYaml.main_url)}
              </a>

              {data.sitesYaml.built_by && (
                <span>
                  {` `}
                  / Built by{` `}
                  {data.sitesYaml.built_by_url ? (
                    <a href={data.sitesYaml.built_by_url}>
                      {data.sitesYaml.built_by}
                    </a>
                  ) : (
                    data.sitesYaml.built_by
                  )}
                </span>
              )}
            </div>
            <div css={{ display: `flex`, borderBottom: `1px solid #F5F3F7` }}>
              {data.sitesYaml.featured && (
                <div
                  css={{
                    padding: `20px`,
                    display: `flex`,
                    borderRight: `1px solid #F5F3F7`,
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
                    padding: `20px`,
                    display: `flex`,
                    borderRight: `1px solid #F5F3F7`,
                  }}
                >
                  <img
                    src={GithubIcon}
                    alt="icon"
                    css={{ marginBottom: 0, marginRight: 10 }}
                  />
                  <a href={data.sitesYaml.source_url}>Source</a>
                </div>
              )}
              {false && ( // TODO: NOT IMPLEMENTED YET!!!
                <div
                  css={{
                    padding: `20px`,
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
              // resolutions={
              //   data.sitesYaml.childScreenshot.screenshotFile.childImageSharp
              //     .resolutions
              // }

              sizes={
                data.sitesYaml.childScreenshot.screenshotFile.childImageSharp
                  .sizes
              }
              alt={`Screenshot of ${data.sitesYaml.title}`}
            />
            <p
              css={{
                // width: `500px`, // disabled, not responsive
                padding: `20px`,
              }}
            >
              {data.sitesYaml.description}
            </p>
            <div css={{ display: `flex`, padding: `20px` }}>
              <div css={{ paddingRight: `20px` }}>Categories</div>
              <div>{categories.join(`, `)}</div>
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
function PermalinkPageFooter({ nextSite, previousSite, isModal }) {
  let windowWidth

  if (!windowWidth && typeof window !== `undefined`) {
    windowWidth = window.innerWidth
  }
  if (isModal && windowWidth > 750) return null
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
            nextSite.childScreenshot.screenshotFile.childImageSharp.resolutions
          }
          alt=""
        />
      </div>
    </div>
  )
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
