import React from "react"
import Link from "gatsby-link"
import { rhythm, scale, options } from "../utils/typography"
import Container from "../components/container"
import presets from "../utils/presets"
import colors from "../utils/colors"

const mobileBackgroundImage = {
  backgroundImage: `
            linear-gradient(-45deg, #744c9e 30%, transparent 30%),
            linear-gradient(-45deg, #9d7cbf 40%, transparent 40%),
            linear-gradient(45deg, #f5f3f7 33%, white 33%)`,
}
const phabletBackgroundImage = {
  backgroundImage: `
            linear-gradient(-45deg, #744c9e 32.5%, transparent 32.5%),
            linear-gradient(-45deg, #9d7cbf 47.5%, transparent 47.5%),
            linear-gradient(45deg, #f5f3f7 37.5%, white 37.5%)`,
}
const desktopBackgroundImage = {
  backgroundImage: `
            linear-gradient(-45deg, #744c9e 40%, transparent 40%),
            linear-gradient(-45deg, #9d7cbf 50%, transparent 50%),
            linear-gradient(45deg, #f5f3f7 33%, white 33%)`,
}
const FuturaParagraph = ({ children }) =>
  <p css={{ fontFamily: options.headerFontFamily.join(`,`), ...scale(1 / 10) }}>
    {children}
  </p>

const headerHeight = `55px`
const ctaButtonStyles = {
  ...scale(2 / 5),
  display: `inline-block`,
  fontFamily: options.headerFontFamily.join(`,`),
  padding: `${rhythm(1 / 2)} ${rhythm(1)}`,
  // Increase specificity
  "&&": {
    border: `1px solid #744c9e`,
    boxShadow: `none`,
    color: `#744c9e`,
    ":hover": { background: `#744c9e`, color: `white` },
  },
}
const IndexRoute = React.createClass({
  render() {
    console.log(this.props)
    const blogPosts = this.props.data.allMarkdownRemark.edges.map(
      edge => edge.node
    )
    return (
      <div>
        <div
          css={{
            background: presets.purple,
            ...mobileBackgroundImage,
            // backgroundImage: `url("http://www.transparenttextures.com/patterns/argyle.png")`,
            // backgroundImage: `linear-gradient(135deg,${colors.b[14]},${colors
            // .b[13]},${colors.b[12]})`,
            paddingBottom: rhythm(1),
            paddingTop: headerHeight,
            minHeight: rhythm(20),
            [presets.Phablet]: {
              ...phabletBackgroundImage,
            },
            [presets.Desktop]: {
              ...desktopBackgroundImage,
            },
          }}
        >
          <div
            css={{
              padding: rhythm(1),
              paddingLeft: rhythm(1.5),
              [presets.Mobile]: {
                width: rhythm(17),
              },
              [presets.Phablet]: {
                width: rhythm(18),
              },
              [presets.Tablet]: {
                width: rhythm(20),
              },
              [presets.Desktop]: {
                width: rhythm(23),
              },
              [presets.Hd]: {
                padding: rhythm(1),
                paddingLeft: rhythm(2.5),
                width: rhythm(28),
              },
              [presets.VHd]: {
                paddingLeft: rhythm(3.5),
                width: rhythm(29),
              },
              [presets.VVHd]: {
                paddingLeft: rhythm(4.5),
                width: rhythm(30),
              },
            }}
          >
            <h1
              css={{
                marginTop: rhythm(1),
                marginBottom: rhythm(1.5),
                color: `#744c9e`,
                ...scale(0.9),
                lineHeight: 1,
                [presets.Mobile]: {
                  fontSize: scale(1.1).fontSize,
                },
                [presets.Phablet]: {
                  fontSize: scale(1.2).fontSize,
                },
                [presets.Tablet]: {
                  fontSize: scale(1.3).fontSize,
                },
                [presets.Desktop]: {
                  fontSize: scale(1.5).fontSize,
                },
                [presets.Hd]: {
                  fontSize: scale(1.75).fontSize,
                },
              }}
            >
              Blazing-fast static site generator for React
            </h1>
            <div>
              <Link css={ctaButtonStyles} to="/docs/">
                Get Started
              </Link>
            </div>
          </div>
        </div>
        <Container hasSideBar={false}>
          <div
            css={{
              [presets.Tablet]: {
                marginLeft: rhythm(-1),
                marginRight: rhythm(-1),
              },
            }}
          >
            <div css={{ display: `flex`, flexWrap: `wrap` }}>
              <div
                css={{
                  flex: `0 0 100%`,
                  [presets.Tablet]: { flex: 1, padding: `0 ${rhythm(1)}` },
                }}
              >
                <h2>Modern web tech without the headache</h2>
                <FuturaParagraph>
                  Enjoy all the power of the latest web technologies. React.js,
                  webpack, modern JavaScript and CSS and more are all setup and
                  waiting for you to install and start building.
                </FuturaParagraph>
              </div>
              <div
                css={{
                  flex: `0 0 100%`,
                  [presets.Tablet]: { flex: 1, padding: `0 ${rhythm(1)}` },
                }}
              >
                <h2>Bring your own data</h2>
                <FuturaParagraph>
                  Gatsby’s rich data plugin ecosystem lets you build sites with
                  the data you want. Integrate data from one or many sources:
                  headless CMSs, SaaS services, APIs, databases, your file
                  system, and more. Pull data directly into your pages using
                  GraphQL.
                </FuturaParagraph>
              </div>
            </div>
            <div css={{ display: `flex`, flexWrap: `wrap` }}>
              <div
                css={{
                  flex: `0 0 100%`,
                  [presets.Tablet]: { flex: 1, padding: `0 ${rhythm(1)}` },
                }}
              >
                <h2>Scale to the entire internet</h2>
                <FuturaParagraph>
                  Gatsby.js is Internet Scale. Forget complicated deploys with
                  databases and servers and their expensive, time-consuming
                  setup costs, maintenance, and scaling fears. Gatsby.js builds
                  your site as “static” files which can be deployed easily on
                  dozens of services.
                </FuturaParagraph>
              </div>
              <div
                css={{
                  flex: `0 0 100%`,
                  [presets.Tablet]: { flex: 1, padding: `0 ${rhythm(1)}` },
                }}
              >
                <h2>Future-proof your website</h2>
                <FuturaParagraph>
                  Don't build a website with last decade's tech. The future of
                  the web is mobile, JavaScript and APIs—the {` `}
                  <a href="https://jamstack.org/">JAMstack</a>. Every website is
                  a web app and every web app is a website. Gatsby.js is the
                  universal JavaScript framework you’ve been waiting for.
                </FuturaParagraph>
              </div>
            </div>
            <div css={{ display: `flex`, flexWrap: `wrap` }}>
              <div
                css={{
                  flex: `0 0 100%`,
                  [presets.Tablet]: { flex: 1, padding: `0 ${rhythm(1)}` },
                }}
              >
                <h2>
                  <em>Static</em> Progressive Web Apps
                </h2>
                <FuturaParagraph>
                  Gatsby.js is a static PWA (Progressive Web App) generator. You
                  get code and data splitting out-of-the-box. Gatsby loads an
                  HTML file that’s a server rendered version of your React.js
                  page then makes it live with JavaScript. Code and data for
                  other pages get preloaded so clicking around the site feels
                  incredibly fast.
                </FuturaParagraph>
              </div>
              <div
                css={{
                  flex: `0 0 100%`,
                  [presets.Tablet]: { flex: 1, padding: `0 ${rhythm(1)}` },
                }}
              >
                <h2>Speed past the competition</h2>
                <FuturaParagraph>
                  Gatsby.js builds the fastest possible website. Instead of
                  waiting to generate pages when requested, pre-build pages and
                  lift them into a global cloud of servers—ready to be delivered
                  instantly to your users wherever they are.
                </FuturaParagraph>
              </div>
            </div>
          </div>
          <div>
            <h1>How Gatsby works</h1>
            <img
              src={this.props.data.file.childImageSharp.responsiveSizes.src}
              srcSet={
                this.props.data.file.childImageSharp.responsiveSizes.srcSet
              }
              sizes={this.props.data.file.childImageSharp.responsiveSizes.sizes}
            />
          </div>
          <div css={{ textAlign: `center`, padding: `${rhythm(2)} 0` }}>
            <h1 css={{ marginTop: 0 }}>Curious yet?</h1>
            <FuturaParagraph>
              It only takes a few minutes to get up and running!
            </FuturaParagraph>
            <Link css={ctaButtonStyles} to="/docs/">
              Get Started
            </Link>
          </div>
        </Container>
        <div
          css={{
            backgroundColor: `#f5f3f7`,
            padding: `${rhythm(0.25)} 0`,
            [presets.Tablet]: {
              padding: `${rhythm(2)} 0`,
            },
          }}
        >
          <Container>
            <h2
              css={{
                textAlign: `left`,
                marginTop: 0,
                color: `#744c9e`,
                [presets.Tablet]: {
                  paddingBottom: rhythm(1),
                },
              }}
            >
              Latest from the Gatsby blog
            </h2>
            {blogPosts.map(post => {
              const avatar =
                post.frontmatter.author.avatar.childImageSharp
                  .responsiveResolution
              return (
                <div key={post.fields.slug} css={{ paddingBottom: rhythm(2) }}>
                  <Link to={post.fields.slug}>
                    <h2
                      css={{
                        marginBottom: rhythm(1 / 8),
                      }}
                    >
                      {post.frontmatter.title}
                    </h2>
                    <p
                      css={{
                        color: colors.b[13],
                      }}
                    >
                      {post.frontmatter.excerpt
                        ? post.frontmatter.excerpt
                        : post.excerpt}
                    </p>
                  </Link>
                  <div>
                    <img
                      alt={`Avatar for ${post.frontmatter.author.id}`}
                      src={avatar.src}
                      srcSet={avatar.srcSet}
                      height={avatar.height}
                      width={avatar.width}
                      css={{
                        borderRadius: `100%`,
                        display: `inline-block`,
                        marginRight: rhythm(1 / 2),
                        marginBottom: 0,
                        verticalAlign: `top`,
                      }}
                    />
                    <div
                      css={{
                        display: `inline-block`,
                      }}
                    >
                      <div
                        css={{
                          color: colors.b[12],
                          lineHeight: 1.1,
                        }}
                      >
                        <small>
                          {post.frontmatter.author.id}
                        </small>
                      </div>
                      <div
                        css={{
                          color: colors.b[12],
                          lineHeight: 1.1,
                        }}
                      >
                        <small>
                          <em>
                            {post.frontmatter.date}
                          </em>
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </Container>
        </div>
      </div>
    )
  },
})

export default IndexRoute

export const pageQuery = graphql`
  query Index {
    site {
      siteMetadata {
        title
      }
    }
    file(relativePath: { eq: "gatsby-explanation.png" }) {
      childImageSharp {
        responsiveSizes(maxWidth: 870) {
          src
          srcSet
          sizes
        }
      }
    }
    allMarkdownRemark(
      sort: { order: DESC, fields: [frontmatter___date] }
      limit: 2
      filter: {
        frontmatter: { draft: { ne: true } }
        fileAbsolutePath: { regex: "/blog/" }
      }
    ) {
      edges {
        node {
          excerpt
          fields {
            slug
          }
          frontmatter {
            excerpt
            title
            date(formatString: "DD MMMM, YYYY")
            author {
              id
              avatar {
                childImageSharp {
                  responsiveResolution(width: 35, height: 35) {
                    width
                    height
                    src
                    srcSet
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`
