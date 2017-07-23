import React from "react"
import Link from "gatsby-link"
import { rhythm, scale, options } from "../utils/typography"
import Container from "../components/container"
import BlogPostPreviewItem from "../components/blog-post-preview-item"
import Hero from "../components/hero"
import CtaButton from "../components/cta-button"
import presets from "../utils/presets"
import colors from "../utils/colors"

const Card = ({ children }) =>
  <div
    css={{
      flex: `0 0 100%`,
      paddingLeft: 0,
      paddingRight: 0,
      [presets.Tablet]: {
        flex: 1,
        flexBasis: `50%`,
        maxWidth: `50%`,
        paddingLeft: vP,
        paddingRight: vP,
      },
    }}
  >
    {children}
  </div>

const CardHeadline = ({ children }) =>
  <h2 css={{ ...scale(2 / 5), lineHeight: 1.2 }}>
    {children}
  </h2>

const FuturaParagraph = ({ children }) =>
  <p
    css={{
      fontFamily: options.headerFontFamily.join(`,`),
      ...scale(1 / 10),
    }}
  >
    {children}
  </p>

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

const IndexRoute = React.createClass({
  render() {
    console.log(this.props)
    const blogPosts = this.props.data.allMarkdownRemark
    return (
      <div>
        <Hero />
        <div
          className="flexContainer"
          css={{
            ...verticalPadding,
            // marginLeft: vP,
            // marginRight: vP,
            // [presets.Hd]: {
            //   marginLeft: vPHd,
            //   marginRight: vPHd,
            // },
            // [presets.VHd]: {
            //   marginLeft: vPVHd,
            //   marginRight: vPVHd,
            // },
            // [presets.VVHd]: {
            //   marginLeft: vPVVHd,
            //   marginRight: vPVVHd,
            // },
            [presets.Mobile]: {},
          }}
        >
          <div
            css={{
              background: `white`,
              borderRadius: `3px`,
              ...verticalPadding,
              marginBottom: `3rem`,
              boxShadow: `0 5px 15px rgba(0,0,0,0.1)`,
              [presets.Desktop]: {
                paddingTop: `1rem`,
              },
            }}
          >
            <div
              css={{
                display: `flex`,
                flex: `0 1 auto`,
                flexWrap: `wrap`,
              }}
            >
              <Card>
                <CardHeadline>
                  Modern web tech without the headache
                </CardHeadline>
                <FuturaParagraph>
                  Enjoy all the power of the latest web technologies. React.js,
                  webpack, modern JavaScript and CSS and more are all setup and
                  waiting for you to install and start building.
                </FuturaParagraph>
              </Card>
              <Card>
                <CardHeadline>Bring your own data</CardHeadline>
                <FuturaParagraph>
                  Gatsby’s rich data plugin ecosystem lets you build sites with
                  the data you want. Integrate data from one or many sources:
                  headless CMSs, SaaS services, APIs, databases, your file
                  system, and more. Pull data directly into your pages using
                  GraphQL.
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
                  <em>Static</em> Progressive Web Apps
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
            </div>

            <Container hasSideBar={false}>
              <div>
                <h1>How Gatsby works</h1>
                <img
                  src={this.props.data.file.childImageSharp.responsiveSizes.src}
                  srcSet={
                    this.props.data.file.childImageSharp.responsiveSizes.srcSet
                  }
                  sizes={
                    this.props.data.file.childImageSharp.responsiveSizes.sizes
                  }
                />
              </div>
              <div css={{ textAlign: `center`, padding: `${rhythm(2)} 0` }}>
                <h1 css={{ marginTop: 0 }}>Curious yet?</h1>
                <FuturaParagraph>
                  It only takes a few minutes to get up and running!
                </FuturaParagraph>
                <CtaButton to="/docs/">Get Started</CtaButton>
              </div>
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
