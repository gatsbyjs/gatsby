import React from "react"
import Link from "gatsby-link"
import { rhythm, scale, options } from "../utils/typography"
import Container from "../components/container"
import BlogPostPreviewItem from "../components/blog-post-preview-item"
import presets from "../utils/presets"
import colors from "../utils/colors"

import bg from "../hero-bg-left.svg"
import bgr from "../hero-bg-right.svg"

const FuturaParagraph = ({ children }) =>
  <p css={{ fontFamily: options.headerFontFamily.join(`,`), ...scale(1 / 10) }}>
    {children}
  </p>

const vP = rhythm(presets.vPR)
const vPHd = rhythm(presets.vPHdR)
const vPVHd = rhythm(presets.vPVHdR)
const vPVVHd = rhythm(presets.vPVVHdR)

const vPOff = rhythm(presets.vPR - presets.logoWidth)
const vPHdOff = rhythm(presets.vPHdR - presets.logoWidth)
const vPVHdOff = rhythm(presets.vPVHdR - presets.logoWidth)
const vPVVHdOff = rhythm(presets.vPVVHdR - presets.logoWidth)

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
const cardStyles = {
  flex: `0 0 100%`,
  background: `white`,
  padding: `0 1rem`,
  [presets.Tablet]: {
    flex: 1,
    flexBasis: `50%`,
    maxWidth: `50%`,
  },
  [presets.Desktop]: {
    flexBasis: `33%`,
    maxWidth: `33%`,
  },
}
const HeroUnitBackground = ({ position }) =>
  <div
    className="heroUnitBackground"
    css={{
      position: position,
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
      zIndex: -1,
    }}
  >
    <div
      css={{
        position: `absolute`,
        width: vPOff,
        bottom: 0,
        left: 0,
        top: 0,
        zIndex: -10,
        background: `#F5F3F7`,
        [presets.Hd]: {
          width: vPHdOff,
        },
        [presets.VHd]: {
          width: vPVHdOff,
        },
        [presets.VVHd]: {
          width: vPVVHdOff,
        },
      }}
    />
    <div
      className="heroUnitBackground-white"
      css={{
        position: `absolute`,
        right: 0,
        bottom: 0,
        left: vPOff,
        top: 0,
        zIndex: -2,
        background: `white`,
        [presets.Hd]: {
          left: vPHdOff,
        },
        [presets.VHd]: {
          left: vPVHdOff,
        },
        [presets.VVHd]: {
          left: vPVVHdOff,
        },
      }}
    />
    <div
      className="heroUnitBackground-right"
      css={{
        position: `absolute`,
        right: 0,
        bottom: 0,
        left: position === `absolute` ? `25%` : 0,
        top: 0,
        zIndex: -1,
        background: `url(${bgr})`,
        backgroundRepeat: `no-repeat`,
        backgroundSize: `cover`,
        //backgroundPosition: `0 0`,
      }}
    />
    <div
      className="heroUnitBackground-left"
      css={{
        position: `absolute`,
        right: 0,
        left: vPOff,
        top: 0,
        bottom: 0,
        zIndex: -2,
        background: `url(${bg})`,
        //backgroundSize: `cover`,
        backgroundRepeat: `no-repeat`,
        [presets.Hd]: {
          left: vPHdOff,
        },
        [presets.VHd]: {
          left: vPVHdOff,
        },
        [presets.VVHd]: {
          left: vPVVHdOff,
        },
      }}
    />
  </div>

const HeroUnit = () =>
  <div
    css={{
      padding: rhythm(3 / 4),
      paddingLeft: rhythm(1.5),
      paddingTop: rhythm(4),
      paddingBottom: rhythm(4),
      position: `relative`,
      [presets.Mobile]: {
        width: rhythm(15),
        //background: `yellow`,
      },
      [presets.Phablet]: {
        width: rhythm(17),
        //background: `orange`,
      },
      [presets.Tablet]: {
        width: rhythm(19),
        //background: `orange`,
      },
      [presets.Desktop]: {
        width: rhythm(22),
        //background: `red`,
        paddingBottom: rhythm(5),
      },
      [presets.Hd]: {
        paddingLeft: vPHd,
        width: rhythm(22),
      },
      [presets.VHd]: {
        paddingBottom: rhythm(4),
        paddingLeft: vPVHd,
        width: rhythm(29),
      },
      [presets.VVHd]: {
        paddingBottom: rhythm(6),
        paddingLeft: vPVVHd,
        width: rhythm(30),
      },
    }}
  >
    <h1
      css={{
        color: `#744c9e`,
        ...scale(0.9),
        margin: 0,
        marginBottom: `1em`,
        padding: 0,
        lineHeight: 1,
        [presets.Phablet]: {
          fontSize: scale(1.2).fontSize,
        },
        [presets.Tablet]: {
          fontSize: scale(1.3).fontSize,
        },
        [presets.Desktop]: {
          fontSize: scale(1.5).fontSize,
        },
        [presets.VHd]: {
          fontSize: scale(1.75).fontSize,
        },
      }}
    >
      Blazing-fast static site generator for React
    </h1>
    <Link css={ctaButtonStyles} to="/docs/">
      Get Started
    </Link>
  </div>

const IndexRoute = React.createClass({
  render() {
    console.log(this.props)
    const blogPosts = this.props.data.allMarkdownRemark
    return (
      <div>
        <div
          css={{
            position: `relative`,
          }}
        >
          <HeroUnitBackground position="fixed" />
          <HeroUnit />
        </div>

        <div css={{ ...verticalPadding }}>
          <div
            css={{
              display: `flex`,
              flex: `0 1 auto`,
              flexWrap: `wrap`,
              marginRight: `-1rem`,
              marginLeft: `-1rem`,
              background: `white`,
              paddingBottom: `2rem`,
              //boxShadow: `0 5px 15px rgba(0,0,0,0.2)`,
            }}
          >
            <div css={cardStyles}>
              <h2>Modern web tech without the headache</h2>
              <FuturaParagraph>
                Enjoy all the power of the latest web technologies. React.js,
                webpack, modern JavaScript and CSS and more are all setup and
                waiting for you to install and start building.
              </FuturaParagraph>
            </div>
            <div css={cardStyles}>
              <h2>Bring your own data</h2>
              <FuturaParagraph>
                Gatsby’s rich data plugin ecosystem lets you build sites with
                the data you want. Integrate data from one or many sources:
                headless CMSs, SaaS services, APIs, databases, your file system,
                and more. Pull data directly into your pages using GraphQL.
              </FuturaParagraph>
            </div>
            <div css={cardStyles}>
              <h2>Scale to the entire internet</h2>
              <FuturaParagraph>
                Gatsby.js is Internet Scale. Forget complicated deploys with
                databases and servers and their expensive, time-consuming setup
                costs, maintenance, and scaling fears. Gatsby.js builds your
                site as “static” files which can be deployed easily on dozens of
                services.
              </FuturaParagraph>
            </div>
            <div css={cardStyles}>
              <h2>Future-proof your website</h2>
              <FuturaParagraph>
                Don't build a website with last decade's tech. The future of the
                web is mobile, JavaScript and APIs—the {` `}
                <a href="https://jamstack.org/">JAMstack</a>. Every website is a
                web app and every web app is a website. Gatsby.js is the
                universal JavaScript framework you’ve been waiting for.
              </FuturaParagraph>
            </div>
            <div css={cardStyles}>
              <h2>
                <em>Static</em> Progressive Web Apps
              </h2>
              <FuturaParagraph>
                Gatsby.js is a static PWA (Progressive Web App) generator. You
                get code and data splitting out-of-the-box. Gatsby loads an HTML
                file that’s a server rendered version of your React.js page then
                makes it live with JavaScript. Code and data for other pages get
                preloaded so clicking around the site feels incredibly fast.
              </FuturaParagraph>
            </div>
            <div css={cardStyles}>
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

        <Container hasSideBar={false}>
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
            {blogPosts.edges.map(({ node }) =>
              <BlogPostPreviewItem post={node} key={node.fields.slug} />
            )}
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
          ...BlogPostPreview_item
        }
      }
    }
  }
`
