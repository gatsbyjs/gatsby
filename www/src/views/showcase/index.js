import React, { Component } from "react"
import { Link } from "gatsby"
import Img from "gatsby-image"
import Helmet from "react-helmet"
import hex2rgba from "hex2rgba"
import MdArrowForward from "react-icons/lib/md/arrow-forward"
import { style } from "glamor"

import FilteredShowcase from "./filtered-showcase"
import Layout from "../../components/layout"
import FeaturedSitesIcon from "../../assets/featured-sites-icons.svg"
import { ShowcaseIcon } from "../../assets/mobile-nav-icons"
import { options, scale, rhythm } from "../../utils/typography"
import presets, { colors } from "../../utils/presets"
import scrollToAnchor from "../../utils/scroll-to-anchor"
import URLQuery from "../../components/url-query"

class ShowcaseView extends Component {
  showcase = React.createRef()

  onClickHandler = (target, updateQuery) =>
    target.current
      ? scrollToAnchor(target.current, () => {
          updateQuery(({ filters }) => {
            return { filters: [`Featured`] }
          })
        })
      : () => {}

  render = () => {
    const { location, data } = this.props

    return (
      <Layout location={location}>
        <Helmet>
          <title>Showcase</title>
        </Helmet>
        <section
          className="featured-sites"
          css={{
            margin: `${rhythm(options.blockMarginBottom)} ${rhythm(3 / 4)} 0`,
            position: `relative`,
            display: `none`,
            [presets.Desktop]: {
              display: `block`,
            },
          }}
        >
          <div
            css={{
              background: `url(${FeaturedSitesIcon})`,
              backgroundRepeat: `no-repeat`,
              backgroundSize: `contain`,
              position: `absolute`,
              height: `100%`,
              width: `100%`,
              left: -100,
              opacity: 0.02,
              top: 0,
              zIndex: -1,
            }}
          />
          <div
            css={{
              marginBottom: rhythm(options.blockMarginBottom * 2),
              display: `flex`,
              alignItems: `center`,
              flexWrap: `wrap`,
              [presets.Mobile]: {},
            }}
          >
            <img src={FeaturedSitesIcon} alt="icon" css={{ marginBottom: 0 }} />
            <h1
              css={{
                ...scale(1 / 5),
                color: colors.gatsby,
                fontFamily: options.headerFontFamily.join(`,`),
                fontWeight: `bold`,
                marginRight: 30,
                marginLeft: 15,
                marginTop: 0,
                marginBottom: 0,
              }}
            >
              Featured Sites
            </h1>
            <URLQuery>
              {(_, updateQuery) => (
                <a
                  href="#showcase"
                  {...styles.withTitleHover}
                  css={{
                    display: `none`,
                    [presets.Phablet]: {
                      display: `block`,
                    },
                    "&&": {
                      ...scale(-1 / 6),
                      boxShadow: `none`,
                      borderBottom: 0,
                      color: colors.lilac,
                      cursor: `pointer`,
                      fontFamily: options.headerFontFamily.join(`,`),
                      fontWeight: `normal`,
                      "&:hover": {
                        background: `transparent`,
                        color: colors.gatsby,
                      },
                    },
                  }}
                  onClick={this.onClickHandler(this.showcase, updateQuery)}
                >
                  <span className="title">View all</span>&nbsp;<MdArrowForward
                    style={{ marginLeft: 4, verticalAlign: `sub` }}
                  />
                </a>
              )}
            </URLQuery>
            <div
              css={{
                display: `flex`,
                alignItems: `center`,
                marginLeft: `auto`,
              }}
            >
              <div
                css={{
                  ...scale(-1 / 6),
                  color: colors.gray.calm,
                  marginRight: 15,
                  fontFamily: options.headerFontFamily.join(`,`),
                  display: `none`,
                  [presets.Tablet]: {
                    display: `block`,
                  },
                }}
              >
                Want to get featured?
              </div>
              <a
                href="https://next.gatsbyjs.org/docs/site-showcase-submissions/"
                target="_blank"
                rel="noopener noreferrer"
                css={{
                  ...styles.button,
                }}
              >
                Submit{` `}
                <span
                  css={{
                    display: `none`,
                    [presets.Desktop]: {
                      display: `inline`,
                    },
                  }}
                >
                  your{` `}
                </span>Site
                <MdArrowForward
                  style={{ marginLeft: 4, verticalAlign: `sub` }}
                />
              </a>
            </div>
          </div>
          <div
            css={{
              position: `relative`,
            }}
          >
            <div
              css={{
                display: `flex`,
                overflowX: `scroll`,
                flexShrink: 0,
                margin: `0 -${rhythm(3 / 4)}`,
                padding: `3px ${rhythm(3 / 4)} 0`,
                ...styles.scrollbar,
              }}
            >
              {data.featured.edges.slice(0, 9).map(({ node }) => (
                <Link
                  key={node.id}
                  {...styles.featuredSitesCard}
                  {...styles.withTitleHover}
                  css={{
                    "&&": {
                      borderBottom: `none`,
                      boxShadow: `none`,
                      transition: `box-shadow .3s cubic-bezier(.4,0,.2,1), transform .3s cubic-bezier(.4,0,.2,1)`,
                      "&:hover": {
                        ...styles.screenshotHover,
                      },
                    },
                  }}
                  to={{
                    pathname: node.fields && node.fields.slug,
                    state: { isModal: true },
                  }}
                >
                  {node.childScreenshot && (
                    <Img
                      sizes={
                        node.childScreenshot.screenshotFile.childImageSharp
                          .sizes
                      }
                      alt={node.title}
                      css={{
                        ...styles.screenshot,
                      }}
                    />
                  )}
                  <div>
                    <span className="title">{node.title}</span>
                  </div>
                  <div
                    css={{
                      ...scale(-1 / 6),
                      color: colors.gray.calm,
                      fontWeight: `normal`,
                      [presets.Desktop]: {
                        marginTop: `auto`,
                      },
                    }}
                  >
                    {node.built_by && <div>Built by {node.built_by}</div>}
                    <div css={{ opacity: 0.5 }}>
                      {node.categories && node.categories.join(`, `)}
                    </div>
                  </div>
                </Link>
              ))}
              <div
                css={{
                  display: `flex`,
                }}
              >
                <URLQuery>
                  {(_, updateQuery) => (
                    <a
                      href="#showcase"
                      {...styles.featuredSitesCard}
                      css={{
                        marginRight: `${rhythm(3 / 4)} !important`,
                        border: `1px solid ${hex2rgba(colors.lilac, 0.2)}`,
                        borderRadius: presets.radius,
                        textAlign: `center`,
                        "&&": {
                          boxShadow: `none`,
                          transition: `all ${presets.animation.speedDefault} ${
                            presets.animation.curveDefault
                          }`,
                          "&:hover": {
                            backgroundColor: hex2rgba(colors.ui.light, 0.25),
                            transform: `translateY(-3px)`,
                            boxShadow: `0 8px 20px ${hex2rgba(
                              colors.lilac,
                              0.5
                            )}`,
                          },
                        },
                      }}
                      onClick={this.onClickHandler(this.showcase, updateQuery)}
                    >
                      <div
                        css={{
                          margin: rhythm(1),
                          background: colors.ui.whisper,
                          display: `flex`,
                          alignItems: `center`,
                          position: `relative`,
                          flexBasis: `100%`,
                        }}
                      >
                        <img
                          src={ShowcaseIcon}
                          css={{
                            position: `absolute`,
                            height: `100%`,
                            width: `auto`,
                            display: `block`,
                            margin: `0`,
                            opacity: 0.04,
                          }}
                          alt=""
                        />
                        <span
                          css={{
                            margin: `0 auto`,
                            color: colors.gatsby,
                          }}
                        >
                          <img
                            src={ShowcaseIcon}
                            css={{
                              height: 44,
                              width: `auto`,
                              display: `block`,
                              margin: `0 auto ${rhythm(
                                options.blockMarginBottom
                              )}`,
                              [presets.Tablet]: {
                                height: 64,
                              },
                              [presets.Hd]: {
                                height: 72,
                              },
                            }}
                            alt=""
                          />
                          View all Featured Sites
                        </span>
                      </div>
                    </a>
                  )}
                </URLQuery>
              </div>
            </div>
            <div
              css={{
                position: `absolute`,
                top: `0`,
                bottom: rhythm(options.blockMarginBottom),
                right: `-${rhythm(3 / 4)}`,
                width: 60,
                pointerEvents: `none`,
                background: `linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(255,255,255,1) 100%)`,
              }}
            />
          </div>
        </section>
        <div
          id="showcase"
          css={{
            position: `relative`,
            top: `calc(-${presets.headerHeight} + 1px)`,
            height: 1,
          }}
          ref={this.showcase}
        />
        <FilteredShowcase data={data} />
      </Layout>
    )
  }
}

export default ShowcaseView

const styles = {
  featuredSitesCard: style({
    display: `flex`,
    flexDirection: `column`,
    flexGrow: 0,
    flexShrink: 0,
    width: 320,
    marginBottom: rhythm(options.blockMarginBottom * 2),
    marginRight: rhythm(3 / 4),
    [presets.Hd]: {
      width: 360,
      marginRight: rhythm(6 / 4),
    },
    [presets.VHd]: {
      width: 400,
    },
  }),
  withTitleHover: style({
    "& .title": {
      transition: `box-shadow .3s cubic-bezier(.4,0,.2,1), transform .3s cubic-bezier(.4,0,.2,1)`,
      boxShadow: `inset 0 0px 0px 0px ${colors.ui.whisper}`,
    },
    "&:hover .title": {
      boxShadow: `inset 0 -3px 0px 0px ${colors.ui.bright}`,
    },
  }),
  button: {
    border: 0,
    borderRadius: presets.radius,
    cursor: `pointer`,
    fontFamily: options.headerFontFamily.join(`,`),
    fontWeight: `bold`,
    padding: `${rhythm(1 / 5)} ${rhythm(2 / 3)}`,
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
  },
  sticky: {
    paddingTop: rhythm(options.blockMarginBottom),
    position: `sticky`,
    top: 0,
    [presets.Desktop]: {
      top: `calc(${presets.headerHeight} - 1px)`,
    },
  },
  scrollbar: {
    WebkitOverflowScrolling: `touch`,
    "&::-webkit-scrollbar": {
      width: `6px`,
      height: `6px`,
    },
    "&::-webkit-scrollbar-thumb": {
      background: colors.ui.bright,
    },
    "&::-webkit-scrollbar-track": {
      background: colors.ui.light,
    },
  },
  screenshot: {
    borderRadius: presets.radius,
    boxShadow: `0 4px 10px ${hex2rgba(colors.gatsby, 0.1)}`,
    marginBottom: rhythm(options.blockMarginBottom / 2),
    transition: `all ${presets.animation.speedDefault} ${
      presets.animation.curveDefault
    }`,
  },
  screenshotHover: {
    background: `transparent`,
    color: colors.gatsby,
    "& .gatsby-image-wrapper": {
      transform: `translateY(-3px)`,
      boxShadow: `0 8px 20px ${hex2rgba(colors.lilac, 0.5)}`,
    },
  },
}
