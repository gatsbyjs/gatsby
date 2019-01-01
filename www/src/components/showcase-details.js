import React, { Fragment } from "react"
import { Helmet } from "react-helmet"
import url from "url"
import Img from "gatsby-image"
import qs from "qs"

import presets, { colors } from "../utils/presets"
import { options, scale, rhythm } from "../utils/typography"
import sharedStyles from "../views/shared/styles"
import { Link, StaticQuery, graphql } from "gatsby"
import Layout from "../components/layout"
import ShareMenu from "../components/share-menu"

import MdArrowUpward from "react-icons/lib/md/arrow-upward"
import MdLaunch from "react-icons/lib/md/launch"
import FeaturedIcon from "../assets/featured-detailpage-featuredicon.svg"
import FeatherIcon from "../assets/showcase-feather.svg"
import GithubIcon from "react-icons/lib/go/mark-github"

const gutter = rhythm(3 / 4)
const gutterDesktop = rhythm(6 / 4)

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

const cleanUrl = mainUrl => {
  const parsed = url.parse(mainUrl)
  let path = parsed.pathname
  if (path[path.length - 1] === `/`) path = path.slice(0, path.length - 1)
  return parsed.hostname + path
}

const ShowcaseDetails = ({ parent, data, isModal, categories }) => (
  <StaticQuery
    query={graphql`
      query {
        allSitesYaml(
          filter: { featured: { eq: true }, main_url: { ne: null } }
        ) {
          edges {
            node {
              id
              url
              title
              fields {
                slug
              }
              childScreenshot {
                screenshotFile {
                  childImageSharp {
                    resize(width: 200, height: 200) {
                      src
                    }
                  }
                }
              }
            }
          }
        }
      }
    `}
    render={staticData => {
      const allSitesYaml = staticData.allSitesYaml
      const nextSite = parent.getNext(allSitesYaml)
      const previousSite = parent.getPrevious(allSitesYaml)

      return (
        <Layout
          location={parent.props.location}
          isModal={isModal}
          modalBackgroundPath="/showcase"
          modalNext={() => parent.next(allSitesYaml)}
          modalPrevious={() => parent.previous(allSitesYaml)}
          modalNextLink={
            <Link
              to={nextSite.fields.slug}
              state={{
                isModal: true,
              }}
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
                  key={nextSite.id}
                  css={{
                    ...styles.prevNextImage,
                  }}
                  backgroundColor
                  fixed={{
                    srcSet: ``,
                    src:
                      nextSite.childScreenshot.screenshotFile.childImageSharp
                        .resize.src,
                    width: 100,
                    height: 100,
                  }}
                  alt=""
                />
              </div>
              <div
                css={{
                  ...styles.prevNextLink,
                }}
              >
                <MdArrowUpward />
                <div> Next Site in Showcase </div>
                <div
                  css={{
                    ...styles.prevNextLinkSiteTitle,
                  }}
                >
                  {nextSite.title}
                </div>
              </div>
            </Link>
          }
          modalPreviousLink={
            <Link
              to={previousSite.fields.slug}
              state={{
                isModal: true,
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
                  key={previousSite.id}
                  css={{
                    ...styles.prevNextImage,
                  }}
                  backgroundColor
                  fixed={{
                    srcSet: ``,
                    src:
                      previousSite.childScreenshot.screenshotFile
                        .childImageSharp.resize.src,
                    width: 100,
                    height: 100,
                  }}
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
                <div> Previous Site in Showcase </div>
                <div
                  css={{
                    ...styles.prevNextLinkSiteTitle,
                  }}
                >
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
                  property="og:image"
                  content={`https://www.gatsbyjs.org${
                    data.sitesYaml.childScreenshot.screenshotFile
                      .childImageSharp.resize.src
                  }`}
                />
                <meta
                  name="twitter:image"
                  content={`https://www.gatsbyjs.org${
                    data.sitesYaml.childScreenshot.screenshotFile
                      .childImageSharp.resize.src
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
                <h1
                  css={{
                    margin: 0,
                  }}
                >
                  {data.sitesYaml.title}
                </h1>
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
                    <span
                      css={{
                        paddingRight: 8,
                        paddingLeft: 8,
                      }}
                    >
                      /
                    </span>
                    Built by {` `}
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
                      css={{
                        marginBottom: 0,
                        marginRight: 10,
                      }}
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
                    <a
                      href={data.sitesYaml.source_url}
                      css={{
                        ...styles.link,
                      }}
                    >
                      <GithubIcon
                        style={{
                          fontSize: 20,
                          marginRight: 10,
                          verticalAlign: `text-bottom`,
                        }}
                      />
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
                      css={{
                        marginBottom: 0,
                        marginRight: 10,
                      }}
                    />
                    <a href={data.sitesYaml.source_url}> Case Study </a>
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
                    right: rhythm(3 / 4),
                    top: rhythm(-15 / 8),
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
                    <MdLaunch
                      style={{
                        verticalAlign: `sub`,
                      }}
                    />
                    Visit site
                    {` `}
                  </a>
                  <ShareMenu
                    url={data.sitesYaml.main_url}
                    title={data.sitesYaml.title}
                    image={`https://www.gatsbyjs.org${
                      data.sitesYaml.childScreenshot.screenshotFile
                        .childImageSharp.resize.src
                    }`}
                  />
                </div>
                <Img
                  key={data.sitesYaml.id}
                  fluid={
                    data.sitesYaml.childScreenshot.screenshotFile
                      .childImageSharp.fluid
                  }
                  alt={`Screenshot of ${data.sitesYaml.title}`}
                  css={{
                    boxShadow: isModal
                      ? false
                      : sharedStyles.screenshot.boxShadow,
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
                  <div
                    css={{
                      color: colors.gray.calm,
                      paddingRight: 20,
                    }}
                  >
                    Categories
                    {` `}
                  </div>
                  <div>
                    {categories.map((c, i) => (
                      <Fragment key={c}>
                        <Link
                          to={`/showcase?${qs.stringify({ filters: [c] })}`}
                          state={{ isModal: true }}
                        >
                          {c}
                        </Link>
                        {i === categories.length - 1 ? `` : `, `}
                      </Fragment>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Layout>
      )
    }}
  />
)

export default ShowcaseDetails
