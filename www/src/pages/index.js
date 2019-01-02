import React from "react"
import { graphql } from "gatsby"
import { Helmet } from "react-helmet"
import Layout from "../components/layout"
import presets, { colors } from "../utils/presets"
import { rhythm } from "../utils/typography"
import { WebpackIcon, ReactJSIcon, GraphQLIcon } from "../assets/logos"
import { vP } from "../components/gutters"
import Container from "../components/container"
import MastheadBg from "../components/masthead-bg"
import MastheadContent from "../components/masthead"
import Cards from "../components/cards"
import Card from "../components/card"
import UsedBy from "../components/used-by"
import CardHeadline from "../components/card-headline"
import Diagram from "../components/diagram"
import FuturaParagraph from "../components/futura-paragraph"
import Button from "../components/button"
import TechWithIcon from "../components/tech-with-icon"
import HomepageEcosystem from "../components/homepage/homepage-ecosystem"
import HomepageBlog from "../components/homepage/homepage-blog"
import HomepageNewsletter from "../components/homepage/homepage-newsletter"
import {
  setupScrollersObserver,
  unobserveScrollers,
} from "../utils/scrollers-observer"

class IndexRoute extends React.Component {
  componentDidMount() {
    setupScrollersObserver()
  }

  componentWillUnmount() {
    unobserveScrollers()
  }

  combineEcosystemFeaturedItems = ({ starters, plugins, numFeatured = 3 }) =>
    new Array(numFeatured)
      .fill(undefined)
      .reduce(
        (merged, _, index) => merged.concat([starters[index], plugins[index]]),
        []
      )

  render() {
    const {
      data: {
        allMarkdownRemark: { edges: postsData },
        allStartersYaml: { edges: startersData },
        allNpmPackage: { edges: pluginsData },
      },
    } = this.props

    const starters = startersData.map(item => {
      const {
        node: {
          fields: {
            starterShowcase: { slug, name, description, stars },
          },
          childScreenshot: {
            screenshotFile: {
              childImageSharp: { fixed: thumbnail },
            },
          },
        },
      } = item

      return {
        slug: `/starters${slug}`,
        name,
        description,
        stars,
        thumbnail,
        type: `Starter`,
      }
    })

    const plugins = pluginsData.map(item => {
      item.node.type = `Plugin`

      return item.node
    })

    const ecosystemFeaturedItems = this.combineEcosystemFeaturedItems({
      plugins,
      starters,
    })

    const posts = postsData.map(item => item.node)

    return (
      <Layout location={this.props.location}>
        <Helmet>
          <meta
            name="Description"
            content="Blazing fast modern site generator for React. Go beyond static sites: build blogs, ecommerce sites, full-blown apps, and more with Gatsby."
          />
        </Helmet>
        <div css={{ position: `relative` }}>
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
                paddingBottom: 0,
                flex: `0 0 100%`,
                maxWidth: `100%`,
                [presets.Hd]: { padding: vP, paddingTop: 0, paddingBottom: 0 },
              }}
            >
              <main
                id={`reach-skip-nav`}
                css={{
                  display: `flex`,
                  flexDirection: `row`,
                  flexWrap: `wrap`,
                  justifyContent: `space-between`,
                }}
              >
                <Cards>
                  <Card>
                    <CardHeadline>
                      Modern web tech without the headache
                    </CardHeadline>
                    <FuturaParagraph>
                      Enjoy the power of the latest web technologies –{` `}
                      <TechWithIcon icon={ReactJSIcon}>React.js</TechWithIcon>,
                      {` `}
                      <TechWithIcon icon={WebpackIcon}>Webpack</TechWithIcon>,
                      {` `}
                      modern JavaScript and CSS and more — all set up and
                      waiting for you to start building.
                    </FuturaParagraph>
                  </Card>
                  <Card>
                    <CardHeadline>Bring your own data</CardHeadline>
                    <FuturaParagraph>
                      Gatsby’s rich data plugin ecosystem lets you build sites
                      with the data you want — from one or many sources: Pull
                      data from headless CMSs, SaaS services, APIs, databases,
                      your file system, and more directly into your pages using
                      {` `}
                      <TechWithIcon icon={GraphQLIcon}>GraphQL</TechWithIcon>.
                    </FuturaParagraph>
                  </Card>
                  <Card>
                    <CardHeadline>Scale to the entire internet</CardHeadline>
                    <FuturaParagraph>
                      Gatsby.js is Internet Scale. Forget complicated deploys
                      with databases and servers and their expensive,
                      time-consuming setup costs, maintenance, and scaling
                      fears. Gatsby.js builds your site as “static” files which
                      can be deployed easily on dozens of services.
                    </FuturaParagraph>
                  </Card>
                  <Card>
                    <CardHeadline>Future-proof your website</CardHeadline>
                    <FuturaParagraph>
                      Do not build a website with last decade’s tech. The future
                      of the web is mobile, JavaScript and APIs—the {` `}
                      <a href="https://jamstack.org/">JAMstack</a>. Every
                      website is a web app and every web app is a website.
                      Gatsby.js is the universal JavaScript framework you’ve
                      been waiting for.
                    </FuturaParagraph>
                  </Card>
                  <Card>
                    <CardHeadline>
                      <em css={{ color: colors.gatsby, fontStyle: `normal` }}>
                        Static
                      </em>
                      {` `}
                      Progressive Web Apps
                    </CardHeadline>
                    <FuturaParagraph>
                      Gatsby.js is a static PWA (Progressive Web App) generator.
                      You get code and data splitting out-of-the-box. Gatsby
                      loads only the critical HTML, CSS, data, and JavaScript so
                      your site loads as fast as possible. Once loaded, Gatsby
                      prefetches resources for other pages so clicking around
                      the site feels incredibly fast.
                    </FuturaParagraph>
                  </Card>
                  <Card>
                    <CardHeadline>Speed past the competition</CardHeadline>
                    <FuturaParagraph>
                      Gatsby.js builds the fastest possible website. Instead of
                      waiting to generate pages when requested, pre-build pages
                      and lift them into a global cloud of servers — ready to be
                      delivered instantly to your users wherever they are.
                    </FuturaParagraph>
                  </Card>
                  <Diagram />
                  <div css={{ flex: `1 1 100%` }}>
                    <Container hasSideBar={false}>
                      <div
                        css={{
                          textAlign: `center`,
                          padding: `${rhythm(1)} 0 ${rhythm(1.5)}`,
                        }}
                      >
                        <h1 css={{ marginTop: 0 }}>Curious yet?</h1>
                        <FuturaParagraph>
                          It only takes a few minutes to get up and running!
                        </FuturaParagraph>
                        <Button
                          secondary
                          to="/docs/"
                          overrideCSS={{ marginTop: `1rem` }}
                        >
                          Get Started
                        </Button>
                      </div>
                    </Container>
                  </div>
                </Cards>

                <HomepageEcosystem featuredItems={ecosystemFeaturedItems} />

                <HomepageBlog posts={posts} />

                <HomepageNewsletter />
              </main>
            </div>
          </div>
        </div>
      </Layout>
    )
  }
}

export default IndexRoute

export const pageQuery = graphql`
  query IndexRouteQuery(
    $featuredStarters: [String]!
    $featuredPlugins: [String]!
  ) {
    file(relativePath: { eq: "gatsby-explanation.png" }) {
      childImageSharp {
        fluid(maxWidth: 870) {
          src
          srcSet
          sizes
        }
      }
    }
    allMarkdownRemark(
      sort: { order: DESC, fields: [frontmatter___date, fields___slug] }
      limit: 4
      filter: {
        frontmatter: { draft: { ne: true } }
        fileAbsolutePath: { regex: "/docs.blog/" }
        fields: { released: { eq: true } }
      }
    ) {
      edges {
        node {
          ...HomepageBlogPostData
        }
      }
    }
    allStartersYaml(
      filter: {
        fields: { starterShowcase: { slug: { in: $featuredStarters } } }
      }
      sort: { order: DESC, fields: [fields___starterShowcase___stars] }
    ) {
      edges {
        node {
          fields {
            starterShowcase {
              slug
              description
              stars
              name
            }
          }
          childScreenshot {
            screenshotFile {
              childImageSharp {
                fixed(width: 64, height: 64) {
                  ...GatsbyImageSharpFixed_noBase64
                }
              }
            }
          }
        }
      }
    }
    allNpmPackage(filter: { name: { in: $featuredPlugins } }) {
      edges {
        node {
          slug
          name
          description
          humanDownloadsLast30Days
        }
      }
    }
  }
`
