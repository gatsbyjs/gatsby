import React from "react"
import { graphql } from "gatsby"
import { Helmet } from "react-helmet"
import ArrowForwardIcon from "react-icons/lib/md/arrow-forward"

import Layout from "../components/layout"
import { colors, space, mediaQueries, fontWeights } from "../utils/presets"
import Container from "../components/container"
import MastheadContent from "../components/masthead"
import Diagram from "../components/diagram"
import FuturaParagraph from "../components/futura-paragraph"
import Button from "../components/button"
import HomepageFeatures from "../components/homepage/homepage-features"
import HomepageEcosystem from "../components/homepage/homepage-ecosystem"
import HomepageBlog from "../components/homepage/homepage-blog"
import HomepageNewsletter from "../components/homepage/homepage-newsletter"
import HomepageSection from "../components/homepage/homepage-section"
import FooterLinks from "../components/shared/footer-links"
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
        allMdx: { edges: postsData },
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
        <main
          id={`reach-skip-nav`}
          css={{
            display: `flex`,
            flexDirection: `row`,
            flexWrap: `wrap`,
            justifyContent: `space-between`,
          }}
        >
          <MastheadContent />
          <div
            css={{
              padding: space[6],
              paddingTop: 0,
              width: `100%`,
              borderBottom: `1px solid ${colors.purple[10]}`,
              borderTop: `1px solid ${colors.purple[10]}`,
              background: colors.purple[5],
              [mediaQueries.xl]: {
                padding: space[8],
              },
            }}
          >
            <Diagram />
          </div>
          <HomepageFeatures />
          <div css={{ flex: `1 1 100%` }}>
            <Container hasSideBar={false}>
              <section css={{ textAlign: `center` }}>
                <h1 css={{ fontWeight: fontWeights[1], marginTop: 0 }}>
                  Curious yet?
                </h1>
                <FuturaParagraph>
                  It only takes a few minutes to get up and running!
                </FuturaParagraph>
                <Button
                  secondary
                  large
                  to="/docs/"
                  tracking="Curious Yet -> Get Started"
                  overrideCSS={{ marginTop: space[4] }}
                  icon={<ArrowForwardIcon />}
                >
                  Get Started
                </Button>
              </section>
            </Container>
          </div>

          <HomepageEcosystem featuredItems={ecosystemFeaturedItems} />

          <HomepageBlog posts={posts} />

          <HomepageNewsletter />

          <HomepageSection
            css={{
              paddingTop: `0 !important`,
              paddingBottom: `0 !important`,
            }}
          />
        </main>
        <FooterLinks />
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
    allMdx(
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
        fields: {
          starterShowcase: { slug: { in: $featuredStarters } }
          hasScreenshot: { eq: true }
        }
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
