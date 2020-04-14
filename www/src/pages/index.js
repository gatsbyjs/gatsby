/** @jsx jsx */
import { jsx } from "theme-ui"
import React from "react"
import { graphql } from "gatsby"
import { Helmet } from "react-helmet"
import { MdArrowForward as ArrowForwardIcon } from "react-icons/md"

import Container from "../components/container"
import MastheadContent from "../components/masthead"
import Diagram from "../components/diagram"
import FuturaParagraph from "../components/futura-paragraph"
import Button from "../components/button"
import HomepageLogoBanner from "../components/homepage/homepage-logo-banner"
import HomepageFeatures from "../components/homepage/homepage-features"
import HomepageEcosystem from "../components/homepage/homepage-ecosystem"
import HomepageBlog from "../components/homepage/homepage-blog"
import HomepageNewsletter from "../components/homepage/homepage-newsletter"
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
        allMdx: { nodes: postsData },
        allStartersYaml: { nodes: startersData },
        allNpmPackage: { nodes: pluginsData },
      },
    } = this.props

    const starters = startersData.map(item => {
      const {
        fields: {
          starterShowcase: { slug, name, description, stars },
        },
        childScreenshot: {
          screenshotFile: {
            childImageSharp: { fixed: thumbnail },
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
      item.type = `Plugin`

      return item
    })

    const ecosystemFeaturedItems = this.combineEcosystemFeaturedItems({
      plugins,
      starters,
    })

    return (
      <>
        <Helmet>
          <meta
            name="Description"
            content="Blazing fast modern site generator for React. Go beyond static sites: build blogs, e-commerce sites, full-blown apps, and more with Gatsby."
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
            sx={{
              width: `100%`,
              p: 8,
              pt: 0,
            }}
          >
            <Diagram />
          </div>
          <HomepageLogoBanner />
          <HomepageFeatures />
          <div css={{ flex: `1 1 100%` }}>
            <Container withSidebar={false}>
              <section css={{ textAlign: `center` }}>
                <h1 sx={{ fontWeight: `heading`, mt: 0 }}>Curious yet?</h1>
                <FuturaParagraph>
                  It only takes a few minutes to get up and running!
                </FuturaParagraph>
                <Button
                  secondary
                  variant="large"
                  to="/docs/"
                  tracking="Curious Yet -> Get Started"
                  overrideCSS={{ mt: 5 }}
                  icon={<ArrowForwardIcon />}
                >
                  Get Started
                </Button>
              </section>
            </Container>
          </div>

          <HomepageEcosystem featuredItems={ecosystemFeaturedItems} />

          <HomepageBlog posts={postsData} />

          <HomepageNewsletter />
        </main>
        <FooterLinks />
      </>
    )
  }
}

export default IndexRoute

export const pageQuery = graphql`
  query IndexRouteQuery {
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
      nodes {
        ...HomepageBlogPostData
      }
    }
    allStartersYaml(
      filter: {
        fields: { featured: { eq: true }, hasScreenshot: { eq: true } }
      }
      sort: { order: DESC, fields: [fields___starterShowcase___stars] }
    ) {
      nodes {
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
    allNpmPackage(filter: { fields: { featured: { eq: true } } }) {
      nodes {
        slug
        name
        description
        humanDownloadsLast30Days
      }
    }
  }
`
