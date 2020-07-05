/** @jsx jsx */
import { jsx } from "theme-ui"
import React, { useEffect } from "react"
import { graphql } from "gatsby"

import MastheadContent from "../components/masthead"
import Diagram from "../components/diagram"
import HomepageLogoBanner from "../components/homepage/homepage-logo-banner"
import HomepageFeatures from "../components/homepage/homepage-features"
import HomepageGetStarted from "../components/homepage/homepage-get-started"
import HomepageEcosystem from "../components/homepage/homepage-ecosystem"
import HomepageBlog from "../components/homepage/homepage-blog"
import HomepageNewsletter from "../components/homepage/homepage-newsletter"
import PageMetadata from "../components/page-metadata"
import FooterLinks from "../components/shared/footer-links"
import {
  setupScrollersObserver,
  unobserveScrollers,
} from "../utils/scrollers-observer"

const homepageWrapperStyles = {
  display: `flex`,
  flexDirection: `row`,
  flexWrap: `wrap`,
  justifyContent: `space-between`,
}

const combineEcosystemFeaturedItems = ({
  starters,
  plugins,
  numFeatured = 3,
}) =>
  new Array(numFeatured)
    .fill(undefined)
    .reduce(
      (merged, _, index) => merged.concat([starters[index], plugins[index]]),
      []
    )

export default function IndexRoute(props) {
  const {
    data: {
      allMdx: { nodes: postsData },
      allStartersYaml: { nodes: startersData },
      allNpmPackage: { nodes: pluginsData },
    },
  } = props

  useEffect(() => {
    setupScrollersObserver()
    return unobserveScrollers()
  }, [])

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

  const ecosystemFeaturedItems = combineEcosystemFeaturedItems({
    plugins,
    starters,
  })

  return (
    <>
      <PageMetadata description="Blazing fast modern site generator for React. Go beyond static sites: build blogs, e-commerce sites, full-blown apps, and more with Gatsby." />
      <main id={`reach-skip-nav`} sx={homepageWrapperStyles}>
        <MastheadContent />
        <Diagram />
        <HomepageLogoBanner />
        <HomepageFeatures />
        <HomepageGetStarted />
        <HomepageEcosystem featuredItems={ecosystemFeaturedItems} />
        <HomepageBlog posts={postsData} />
        <HomepageNewsletter />
      </main>
      <FooterLinks />
    </>
  )
}

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
      filter: { fields: { section: { eq: "blog" }, released: { eq: true } } }
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
