import React from "react"
import { graphql } from "gatsby"
import ShowcaseDetails from "../components/showcase-details"

export default function ShowcaseTemplate({ location, data }) {
  const isModal =
    location.state && location.state.isModal && window.innerWidth > 750

  const categories = data.categories || []

  /*
   * This shouldn't ever happen due to filtering on hasScreenshot field
   * However, it appears to break Gatsby Build
   * so let's avoid a failure here
   */
  if (!data.childScreenshot || !data.childScreenshot.screenshotFile) {
    data.childScreenshot = {
      screenshotFile: data.fallback,
    }
  }

  return (
    <ShowcaseDetails
      isModal={isModal}
      site={data}
      categories={categories}
      location={location}
    />
  )
}

export const pageQuery = graphql`
  {
    fallback: file(relativePath: { eq: "screenshot-fallback.png" }) {
      childImageSharp {
        ...ScreenshotDetails
      }
    }
  }
`
