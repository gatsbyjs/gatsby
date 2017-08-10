import React from "react"
import Link from "gatsby-link"

import presets from "../utils/presets"
import colors from "../utils/colors"
import { rhythm, scale, options } from "../utils/typography"
import { JSIcon, WebpackIcon, ReactJSIcon, GraphQLIcon } from "../assets/logos"
import { vP, vPHd, vPVHd, vPVVHd } from "../components/gutters"
import Container from "../components/container"
import MastheadContent from "../components/masthead"
import MastheadBg from "../components/masthead-bg"
import UsedBy from "../components/used-by"
import Cards from "../components/cards"
import Card from "../components/card"
import CardHeadline from "../components/card-headline"
import Diagram from "../components/diagram"
import BlogPostPreviewItem from "../components/blog-post-preview-item"
import FuturaParagraph from "../components/futura-paragraph"
import CtaButton from "../components/cta-button"
import TechWithIcon from "../components/tech-with-icon"

const IndexRoute = React.createClass({
  render() {
    console.log(this.props)
    const blogPosts = this.props.data.allMarkdownRemark
    return (
      <div css={{ position: `relative` }}>
        <div
          css={{
            background: presets.brand,
            position: `absolute`,
            bottom: `0`,
            top: `0`,
            left: `0`,
            right: `0`,
            height: `100%`,
            zIndex: -1,
          }}
        />
        <MastheadBg />
        <div
          css={{
            display: `flex`,
            flexDirection: `row`,
            flexWrap: `wrap`,
            justifyContent: `space-between`,
          }}
        >
          <MastheadContent />
          <UsedBy />
          <div
            css={{
              padding: rhythm(presets.gutters.default / 2),
              flex: `0 0 100%`,
              [presets.Hd]: {
                padding: vP,
                paddingTop: 0,
              },
            }}
          >
            <Cards>
              <Card>
                <CardHeadline>
                  Modern web tech without the headache
                </CardHeadline>
                <FuturaParagraph>
                  Enjoy the power of the latest web technologies –{` `}
                  <TechWithIcon icon={ReactJSIcon}>React.js</TechWithIcon>,{` `}
                  <TechWithIcon icon={WebpackIcon}>Webpack</TechWithIcon>,{` `}
                  modern JavaScript and CSS and more — all setup and waiting for
                  you to start building.
                </FuturaParagraph>
              </Card>
              <Card>
                <CardHeadline>Bring your own data</CardHeadline>
                <FuturaParagraph>
                  Gatsby’s rich data plugin ecosystem lets you build sites with
                  the data you want — from one or many sources: Pull data from
                  headless CMSs, SaaS services, APIs, databases, your file
                  system & more directly into your pages using{` `}
                  <TechWithIcon icon={GraphQLIcon}>GraphQL</TechWithIcon>.
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
                <CardHeadline css={{ color: presets.brandDark }}>
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
                  get code and data splitting out-of-the-box. Gatsby loads only
                  the critical HTML, CSS, data, and JavaScript so your site
                  loads as fast as possible. Once loaded, Gatsby prefetches
                  resources for other pages so clicking around the site feels
                  incredibly fast.
                </FuturaParagraph>
              </Card>
              <Card>
                <CardHeadline>Speed past the competition</CardHeadline>
                <FuturaParagraph>
                  Gatsby.js builds the fastest possible website. Instead of
                  waiting to generate pages when requested, pre-build pages and
                  lift them into a global cloud of servers — ready to be
                  delivered instantly to your users wherever they are.
                </FuturaParagraph>
              </Card>

              <Diagram
                containerCSS={{
                  borderTopLeftRadius: 0,
                  borderTopRightRadius: 0,
                  flex: `1 1 100%`,
                  borderTop: `1px solid ${presets.veryLightPurple}`,
                }}
              />

              <div css={{ flex: `1 1 100%` }}>
                <Container hasSideBar={false}>
                  <div
                    css={{
                      textAlign: `center`,
                      padding: `${rhythm(1)} 0 ${rhythm(2)}`,
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
              </div>

              <div
                css={{
                  borderTop: `1px solid ${presets.veryLightPurple}`,
                  flex: `1 1 100%`,
                  [presets.Tablet]: {
                    paddingTop: rhythm(1),
                  },
                }}
              >
                <Container
                  hasSideBar={false}
                  css={{ maxWidth: rhythm(30), paddingBottom: `0 !important` }}
                >
                  <h2
                    css={{
                      textAlign: `left`,
                      marginTop: 0,
                      color: presets.brand,
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
            </Cards>
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
      limit: 3
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
