import React from "react"
import { graphql } from "gatsby"

import ShowcaseDetails from "../components/showcase-details"

export default function ShowcaseTemplate({ data, location }) {
  const isModal =
    location.state && location.state.isModal && window.innerWidth > 750

  const categories = data.sitesYaml.categories || []

  /*
   * This shouldn't ever happen due to filtering on hasScreenshot field
   * However, it appears to break Gatsby Build
   * so let's avoid a failure here
   */
  if (
    !data.sitesYaml.childScreenshot ||
    !data.sitesYaml.childScreenshot.screenshotFile
  ) {
    data.sitesYaml.childScreenshot = {
      screenshotFile: data.fallback,
    }
  }

  return (
    <ShowcaseDetails
      isModal={isModal}
      site={data.sitesYaml}
      categories={categories}
      location={location}
    />
  )
}

export const pageQuery = graphql`
  query($slug: String!) {
    sitesYaml(fields: { slug: { eq: $slug } }) {
      id
      title
      main_url
      featured
      categories
      built_by
      built_by_url
      source_url
      description
      childScreenshot {
        screenshotFile {
          childImageSharp {
            fluid(maxWidth: 700) {
              ...GatsbyImageSharpFluid_noBase64
            }
            resize(width: 1200, height: 627, cropFocus: NORTH, toFormat: JPG) {
              src
              height
              width
            }
          }
        }
      }
      fields {
        slug
      }
    }

    fallback: file(relativePath: { eq: "screenshot-fallback.png" }) {
      childImageSharp {
        ...ScreenshotDetails
      }
    }
  }
`
