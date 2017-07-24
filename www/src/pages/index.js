import React from "react"
import Link from "gatsby-link"
import { rhythm, scale, options } from "../utils/typography"
import Container from "../components/container"
import BlogPostPreviewItem from "../components/blog-post-preview-item"
import Hero from "../components/hero"
import Diagram from "../components/diagram"
import FuturaParagraph from "../components/futura-paragraph"
import CtaButton from "../components/cta-button"
import presets from "../utils/presets"
import colors from "../utils/colors"
import { JSIcon, WebpackIcon, ReactJSIcon, GraphQLIcon } from "../assets/logos"

const vP = rhythm(presets.vPR)
const vPHd = rhythm(presets.vPHdR)
const vPVHd = rhythm(presets.vPVHdR)
const vPVVHd = rhythm(presets.vPVVHdR)

const verticalPadding = {
  paddingLeft: vP,
  paddingRight: vP,
  [presets.Hd]: {
    paddingLeft: vPHd,
    paddingRight: vPHd,
  },
  [presets.VHd]: {
    paddingLeft: vPVHd,
    paddingRight: vPVHd,
  },
  [presets.VVHd]: {
    paddingLeft: vPVVHd,
    paddingRight: vPVVHd,
  },
}

const Card = ({ children }) =>
  <div
    css={{
      boxSizing: `border-box`,
      display: `flex`,
      [presets.Tablet]: {
        flex: `0 0 50%`,
        maxWidth: `50%`,
        boxShadow: `0 1px 0 0 ${presets.veryLightPurple}`,
        "&:nth-child(5),&:nth-child(6)": {
          boxShadow: `none`,
        },
        "&:nth-child(2n)": {
          borderLeft: `1px solid ${presets.veryLightPurple}`,
        },
      },
      [presets.Hd]: {
        flex: `0 0 33.33333333%`,
        maxWidth: `33.33333333%`,
        borderLeft: `1px solid ${presets.veryLightPurple}`,
        "&:nth-child(4)": {
          boxShadow: `none`,
        },
        "&:nth-child(3n+1)": {
          borderLeft: 0,
        },
      },
    }}
  >
    <div
      css={{
        padding: rhythm(presets.vPR / 2),
        paddingBottom: 0,
        [presets.Mobile]: {
          padding: vP,
          paddingBottom: 0,
        },
        [presets.Phablet]: {
          padding: vP,
        },
        [presets.VHd]: {
          padding: vPHd,
        },
        [presets.VVHd]: {
          padding: vPVHd,
        },
      }}
    >
      {children}
    </div>
  </div>

const CardHeadline = ({ children }) =>
  <h2
    css={{
      ...scale(2 / 5),
      lineHeight: 1.2,
      marginTop: 0,
      //color: presets.brand,
      [presets.Tablet]: {
        ...scale(1 / 10),
        lineHeight: 1.2,
      },
      [presets.Desktop]: {
        ...scale(3 / 10),
        lineHeight: 1.2,
      },
      [presets.VHd]: {
        ...scale(5 / 10),
        lineHeight: 1.2,
      },
      [presets.VVHd]: {
        ...scale(7 / 10),
        lineHeight: 1.2,
      },
    }}
  >
    {children}
  </h2>

const IndexRoute = React.createClass({
  render() {
    console.log(this.props)
    const blogPosts = this.props.data.allMarkdownRemark
    return (
      <div>
        <Hero />
        <div
          css={{
            marginLeft: rhythm(presets.vPR / 2),
            marginRight: rhythm(presets.vPR / 2),
            [presets.Hd]: {
              marginLeft: rhythm(presets.vPHd),
              marginRight: rhythm(presets.vPHd),
            },
            [presets.VHd]: {
              marginLeft: rhythm(presets.vPVHd),
              marginRight: rhythm(presets.vPVHd),
            },
          }}
        >
          <div
            css={{
              paddingBottom: rhythm(presets.vPR / 2),
              [presets.Hd]: {
                paddingBottom: vP,
              },
            }}
          >
            <div
              css={{
                display: `flex`,
                flex: `0 1 auto`,
                flexWrap: `wrap`,
                background: `rgba(255,255,255,0.975)`,
                borderRadius: presets.radiusLg,
              }}
            >
              <Card>
                <CardHeadline>
                  Modern web tech without the headache
                </CardHeadline>
                <FuturaParagraph>
                  Enjoy all the power of the latest web technologies –{` `}
                  <span css={{ whiteSpace: `nowrap` }}>
                    React.js&nbsp;
                    <img
                      src={ReactJSIcon}
                      css={{
                        height: `1.2em`,
                        width: `auto`,
                        margin: 0,
                        verticalAlign: `middle`,
                      }}
                    />
                  </span>
                  ,{` `}
                  <span css={{ whiteSpace: `nowrap` }}>
                    Webpack&nbsp;
                    <img
                      src={WebpackIcon}
                      css={{
                        height: `1.2em`,
                        width: `auto`,
                        margin: 0,
                        verticalAlign: `middle`,
                      }}
                    />
                  </span>
                  , modern JavaScript and CSS and more – all setup and waiting
                  for you to start building.
                </FuturaParagraph>
              </Card>
              <Card>
                <CardHeadline>Bring your own data</CardHeadline>
                <FuturaParagraph>
                  Gatsby’s rich data plugin ecosystem lets you build sites with
                  the data you want – from one or many sources: Pull data from
                  headless CMSs, SaaS services, APIs, databases, your file
                  system & more directly into your pages using{` `}
                  <span css={{ whiteSpace: `nowrap` }}>
                    GraphQL&nbsp;<img
                      src={GraphQLIcon}
                      css={{
                        height: `1.2em`,
                        width: `auto`,
                        margin: 0,
                        verticalAlign: `middle`,
                      }}
                    />
                  </span>.
                </FuturaParagraph>
              </Card>
              <Card>
                <CardHeadline>Scale to the entire internet</CardHeadline>
                <FuturaParagraph>
                  Gatsby.js is Internet Scale. Forget complicated deploys with
                  databases and servers and their expensive, time-consuming
                  setup costs, maintenance, and scaling fears. Gatsby.js builds
                  your site as “static” files which can be deployed easily on
                  dozens of services.
                </FuturaParagraph>
              </Card>
              <Card>
                <CardHeadline css={{ color: presets.heroDark }}>
                  Future-proof your website
                </CardHeadline>
                <FuturaParagraph>
                  Don't build a website with last decade's tech. The future of
                  the web is mobile, JavaScript and APIs—the {` `}
                  <a href="https://jamstack.org/">JAMstack</a>. Every website is
                  a web app and every web app is a website. Gatsby.js is the
                  universal JavaScript framework you’ve been waiting for.
                </FuturaParagraph>
              </Card>
              <Card>
                <CardHeadline>
                  <em css={{ color: presets.brand, fontStyle: `normal` }}>
                    Static
                  </em>
                  {` `}
                  Progressive Web Apps
                </CardHeadline>
                <FuturaParagraph>
                  Gatsby.js is a static PWA (Progressive Web App) generator. You
                  get code and data splitting out-of-the-box. Gatsby loads an
                  HTML file that’s a server rendered version of your React.js
                  page then makes it live with JavaScript. Code and data for
                  other pages get preloaded so clicking around the site feels
                  incredibly fast.
                </FuturaParagraph>
              </Card>
              <Card>
                <CardHeadline>Speed past the competition</CardHeadline>
                <FuturaParagraph>
                  Gatsby.js builds the fastest possible website. Instead of
                  waiting to generate pages when requested, pre-build pages and
                  lift them into a global cloud of servers—ready to be delivered
                  instantly to your users wherever they are.
                </FuturaParagraph>
              </Card>
              <Diagram
                containerCSS={{
                  borderTopLeftRadius: 0,
                  borderTopRightRadius: 0,
                  background: `transparent`,
                  flex: `1 1 100%`,
                  borderTop: `1px solid ${presets.veryLightPurple}`,
                }}
              />
            </div>
          </div>
        </div>

        <div css={{ background: `white` }}>
          <Container hasSideBar={false}>
            <div
              css={{
                textAlign: `center`,
                padding: `3rem 0`,
              }}
            >
              <h1 css={{ marginTop: 0 }}>Curious yet?</h1>
              <FuturaParagraph>
                It only takes a few minutes to get up and running!
              </FuturaParagraph>
              <CtaButton to="/docs/" overrideCSS={{ marginTop: `1rem` }}>
                Get Started
              </CtaButton>
            </div>
          </Container>
          <div
            css={{
              borderTop: `1px solid #eee`,
              [presets.Tablet]: {
                paddingTop: rhythm(1),
              },
            }}
          >
            <Container hasSideBar={false}>
              {` `}
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
              {blogPosts.edges.map(({ node }) =>
                <BlogPostPreviewItem post={node} key={node.fields.slug} />
              )}
            </Container>
          </div>
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
          ...BlogPostPreview_item
        }
      }
    }
  }
`
