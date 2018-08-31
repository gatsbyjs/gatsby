import React from "react"
import Helmet from "react-helmet"
import { Link, graphql } from "gatsby"
import Img from "gatsby-image"

import FaExtLink from "react-icons/lib/fa/external-link"
import Layout from "../components/layout"
import ShareMenu from "../components/share-menu"
import presets, { colors } from "../utils/presets"
import { /*typography, */ rhythm, scale, options } from "../utils/typography"
import sharedStyles from "../views/shared/styles"
import MdLaunch from "react-icons/lib/md/launch"
import MdStar from "react-icons/lib/md/star"
import MdArrowBack from "react-icons/lib/md/arrow-back"
import GithubIcon from "react-icons/lib/fa/github"

const gutter = rhythm(3 / 4)
const gutterDesktop = rhythm(6 / 4)

class StarterTemplate extends React.Component {
  state = {
    showAllDeps: false,
  }
  render() {
    const { startersYaml } = this.props.data
    const {
      url: demoUrl,
      repo: repoUrl,
      tags,
      description,
      features,
      fields: { starterShowcase },
      childScreenshot: { screenshotFile },
    } = startersYaml

    // preprocessing of dependencies
    const { miscDependencies = [], gatsbyDependencies = [] } = starterShowcase
    const allDeps = [
      ...gatsbyDependencies.map(([name, ver]) => name),
      ...miscDependencies.map(([name, ver]) => name),
    ]
    const shownDeps = this.state.showAllDeps ? allDeps : allDeps.slice(0, 15)
    const showMore =
      !this.state.showAllDeps && allDeps.length - shownDeps.length > 0

    // plug for now
    const isModal = false
    const repoName = starterShowcase.name
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
              <title>{`${repoName}: Gatsby Starter`}</title>
              <meta
                name="og:image"
                content={screenshotFile.childImageSharp.fluid.src}
              />
              <meta
                name="twitter:image"
                content={screenshotFile.childImageSharp.fluid.src}
              />
              <meta
                name="description"
                content={`Gatsby Starter: ${repoName}`}
              />
              <meta
                name="og:description"
                content={`Gatsby Starter: ${repoName}`}
              />
              <meta
                name="twitter:description"
                content={`Gatsby Starter: ${repoName}`}
              />
              <meta name="og:title" content={repoName} />
              <meta name="og:type" content="article" />
              <meta name="twitter.label1" content="Reading time" />
              <meta name="twitter:data1" content={`1 min read`} />
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
              <div>
                <Link
                  to={`/starter-showcase`}
                  {...sharedStyles.withTitleHover}
                  css={{
                    "&&": {
                      ...scale(1 / 5),
                      boxShadow: `none`,
                      borderBottom: 0,
                      color: colors.gatsby,
                      cursor: `pointer`,
                      fontFamily: options.headerFontFamily.join(`,`),
                      fontWeight: `normal`,
                      "&:hover": {
                        background: `transparent`,
                        color: colors.lilac,
                      },
                    },
                  }}
                >
                  <MdArrowBack
                    style={{ marginRight: 4, verticalAlign: `sub` }}
                  />
                  &nbsp;
                  <span className="title">All starters</span>
                </Link>
              </div>
              <div>
                <h1 css={{ margin: 0, display: `inline-block` }}>
                  {starterShowcase.stub}
                </h1>
              </div>
              <div
                className="all-column-container"
                css={{
                  color: colors.gray.dark,
                  display: "flex",
                  flexWrap: "wrap",
                }}
              >
                {/* STARS, LAST UPDATED */}
                <div
                  className="left-column-container"
                  css={{
                    marginTop: rhythm(3 / 4),
                    paddingRight: 30,
                    flexGrow: 0,
                  }}
                >
                  <span
                    css={{
                      color: colors.accent,
                      paddingRight: 30,
                    }}
                  >
                    <MdStar style={{ verticalAlign: `sub` }} />
                    {` `}
                    <span css={{ color: colors.gray.light }}>
                      {starterShowcase.stars}
                    </span>
                  </span>
                  <span
                    css={{
                      color: colors.gray.calm,
                      fontFamily: options.headerFontFamily.join(`,`),
                      paddingRight: 10,
                    }}
                  >
                    Updated
                  </span>
                  {showDate(starterShowcase.githubData.repoMetadata.updated_at)}
                </div>
                <div
                  className="right-column-container"
                  css={{
                    marginTop: rhythm(3 / 4),
                    marginRight: 15,
                    // right column needs to flex itself
                    display: "flex",
                    justifyContent: "space-between",
                    flexGrow: 1,
                  }}
                >
                  {/* BY {AUTHOR} */}
                  <div className="by-author">
                    <span css={{ color: colors.gray.light }}>{`By  `}</span>
                    <a
                      css={{
                        "&&": {
                          boxShadow: `none`,
                          borderBottom: 0,
                          color: colors.lilac,
                          cursor: `pointer`,
                          fontFamily: options.headerFontFamily.join(`,`),
                          "&:hover": {
                            background: `transparent`,
                            color: colors.gatsby,
                          },
                        },
                      }}
                      href={`https://github.com/${starterShowcase.owner.login}`}
                    >
                      <span className="title">
                        {starterShowcase.owner.login}
                      </span>
                    </a>
                  </div>
                  {/* OUT LINK / SHARE LINK */}
                  <div
                    className="out-links"
                    css={{
                      // to position share dropdown
                      position: "relative",
                      zIndex: 1,
                      // marginTop: rhythm(3 / 4),
                      // alignSelf: "flex-end",
                      // flexGrow: "1",
                      // textAlign: "left",
                      // [presets.Desktop]: {
                      //   textAlign: "right",
                      // },
                    }}
                  >
                    <a
                      href={frontmatter.demo}
                      css={{
                        border: 0,
                        borderRadius: presets.radius,
                        color: colors.accent,
                        fontFamily: options.headerFontFamily.join(`,`),
                        fontWeight: `bold`,
                        marginRight: rhythm(1.5 / 4),
                        padding: `${rhythm(1 / 5)} ${rhythm(2 / 3)}`, // @todo same as site showcase but wrong for some reason
                        textDecoration: `none`,
                        WebkitFontSmoothing: `antialiased`,
                        "&&": {
                          backgroundColor: colors.accent,
                          borderBottom: `none`,
                          boxShadow: `none`,
                          color: colors.gatsby,
                          "&:hover": {
                            backgroundColor: colors.accent,
                          },
                        },
                      }}
                    >
                      <MdLaunch style={{ verticalAlign: `sub` }} /> Visit demo
                    </a>
                    <ShareMenu
                      url={`https://github.com/${
                        starterShowcase.githubFullName
                      }`}
                      title={`Check out ${repoName} on the @Gatsby Starter Showcase!`}
                      image={imageSharp.childImageSharp.fluid.src}
                      theme={"accent"}
                    />
                  </div>
                </div>
              </div>
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
              {repoUrl && (
                <div
                  css={{
                    padding: 20,
                    paddingLeft: starterShowcase.featured ? false : 0,
                    display: `flex`,
                    borderRight: `1px solid ${colors.ui.light}`,
                    [presets.Desktop]: {
                      ...scale(-1 / 6),
                    },
                    alignItems: `center`,
                  }}
                >
                  <GithubIcon
                    css={{
                      marginBottom: 0,
                      marginRight: 10,
                      height: 26,
                      width: 20,
                    }}
                  />
                  <a href={repoUrl} css={{ ...styles.link }}>
                    Source
                  </a>
                </div>
              )}

              <div
                css={{
                  display: `none`,
                  [presets.Desktop]: {
                    padding: 20,
                    paddingLeft: 0,
                    flex: 1,
                    justifyContent: `center`,
                    display: `flex`,
                    borderRight: `1px solid ${colors.ui.light}`,
                    ...scale(-1 / 6),
                    alignItems: `center`,
                  },
                }}
              >
                <span css={{ marginRight: 20 }}>Try this starter</span>
                <a
                  href={`https://app.netlify.com/start/deploy?repository=${repoUrl}`}
                  style={{
                    borderBottom: `none`,
                    boxShadow: `none`,
                  }}
                >
                  <img
                    src="https://www.netlify.com/img/deploy/button.svg"
                    alt="Deploy to Netlify"
                    css={{ marginBottom: 0 }}
                  />
                </a>
              </div>
            </div>
            <div
              css={{
                borderTop: `1px solid ${colors.ui.light}`,
                position: `relative`,
              }}
            >
              {imageSharp && (
                <Img
                  fluid={screenshotFile.childImageSharp.fluid}
                  alt={`Screenshot of ${name}`}
                  css={{
                    ...sharedStyles.screenshot,
                  }}
                />
              )}
            </div>
            <div
              css={{
                padding: gutter,
                [presets.Desktop]: {
                  padding: gutterDesktop,
                  display: `grid`,
                  gridTemplateColumns: `auto 1fr`,
                  gridRowGap: `20px`,
                },
              }}
            >
              <div
                css={{
                  color: colors.gray.calm,
                  fontFamily: options.headerFontFamily.join(`,`),
                  paddingRight: 20,
                }}
              >
                Tags
              </div>
              <div>{tags.join(`, `)}</div>

              <div
                css={{
                  color: colors.gray.calm,
                  fontFamily: options.headerFontFamily.join(`,`),
                  paddingRight: 20,
                }}
              >
                Description
              </div>
              <div>{description}</div>

              <div
                css={{
                  color: colors.gray.calm,
                  fontFamily: options.headerFontFamily.join(`,`),
                  paddingRight: 20,
                }}
              >
                Features
              </div>
              <div>
                {features ? (
                  <ul css={{ marginTop: 0 }}>
                    {features.map((f, i) => <li key={i}>{f}</li>)}
                  </ul>
                ) : (
                  `No features`
                )}
              </div>

              <div
                css={{
                  color: colors.gray.calm,
                  fontFamily: options.headerFontFamily.join(`,`),
                  paddingRight: 20,
                }}
              >
                Dependencies
              </div>

              <div>
                <div
                  css={{
                    display: `grid`,
                    gridAutoRows: `50px`,
                    marginBottom: rhythm(options.blockMarginBottom * 5),
                    [presets.Desktop]: {
                      gridTemplateColumns: `repeat(3, 1fr)`,
                      gridColumnGap: 20,
                    },
                  }}
                >
                  {shownDeps &&
                    shownDeps.map(
                      dep =>
                        /^gatsby-/.test(dep) ? (
                          <div key={dep}>
                            <Link to={`/packages/${dep}`}>{dep}</Link>
                          </div>
                        ) : (
                          <div
                            key={dep}
                            css={{
                              ...sharedStyles.truncate,
                              marginBottom: `1rem`,
                            }}
                          >
                            <a href={`https://npm.im/${dep}`}>
                              {`${dep} `}
                              <FaExtLink />
                            </a>
                          </div>
                        )
                    )}
                  {showMore && (
                    <button
                      css={{ ...sharedStyles.button }}
                      onClick={() => {
                        this.setState({ showAllDeps: true })
                      }}
                    >
                      {`Show ${allDeps.length - shownDeps.length} more`}
                    </button>
                  )}
                </div>
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
    startersYaml(fields: { starterShowcase: { slug: { eq: $slug } } }) {
      id
      fields {
        starterShowcase {
          slug
          stub
          description
          stars
          lastUpdated
          owner
          name
          githubFullName
          allDependencies
          gatsbyDependencies
          miscDependencies
        }
      }
      url
      repo
      description
      tags
      features
      internal {
        type
      }
      childScreenshot {
        screenshotFile {
          childImageSharp {
            fluid(maxWidth: 700) {
              ...GatsbyImageSharpFluid
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
    }
  }
`

const styles = {
  link: {
    ".main-body a": {
      // color: `inherit`,
      textDecoration: `none`,
      // transition: `all ${presets.animation.speedFast} ${
      //   presets.animation.curveDefault
      // }`,
      borderBottom: `none`,
      boxShadow: `none`,
      // fontFamily: options.headerFontFamily.join(`,`),
      // fontWeight: `bold`,
      "&:hover": {
        backgroundColor: `none`,
      },
    },
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
}

function showDate(dt) {
  const date = new Date(dt)
  return date.toLocaleDateString(`en-US`, {
    month: `short`,
    day: `numeric`,
    year: `numeric`,
  })
}
