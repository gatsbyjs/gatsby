// @ts-check
import React from "react"
import { graphql } from "gatsby"
import { GatsbyImage, getImage, withArtDirection } from "gatsby-plugin-image"

import PageTitle from "../components/page-title"
import Layout from "../components/layout"

import "./art-direction.css"

const ArtDirection = ({ data, location }) => {
  const images = withArtDirection(getImage(data.floatingImage.localFile), [
    {
      media: "(max-width: 1024px)",
      image: getImage(data.floatingImageMobile.localFile),
    },
  ])

  return (
    <Layout
      location={location}
      image={getImage(data.coverImage.localFile)}
      imageTitle={`“${data.coverImage.title}” by ${data.coverImage.credit} (via unsplash.com)`}
    >
      <PageTitle>Art Direction</PageTitle>
      <GatsbyImage
        className="art-directed"
        image={images}
        alt={`“${data.fullWidthImage.title}” by ${data.fullWidthImage.credit} (via unsplash.com)`}
      />
      <p>
        Art Direction is the ability to provide different images depending on
        the width of the device screen. While{" "}
        <strong>gatsby-plugin-image</strong> provides discrete sizes for these
        screens, they are the same images. Art Direction is supported using a
        function exported from <strong>gatsby-plugin-image</strong>.
      </p>
      <p>
        Resize this page, or view it on separate devices, to see art direction
        in action.
      </p>
      <p />
    </Layout>
  )
}

export default ArtDirection

export const query = graphql`
  {
    coverImage: unsplashImagesYaml(title: { eq: "City from above" }) {
      credit
      title
      localFile {
        childImageSharp {
          gatsbyImageData(width: 720, aspectRatio: 0.5, layout: CONSTRAINED)
        }
      }
    }
    floatingImageMobile: unsplashImagesYaml(title: { eq: "Tennis court" }) {
      localFile {
        childImageSharp {
          gatsbyImageData(width: 400, height: 300, layout: CONSTRAINED)
        }
      }
    }
    floatingImage: unsplashImagesYaml(
      title: { eq: "Pug with yellow raincoat" }
    ) {
      credit
      title
      localFile {
        childImageSharp {
          gatsbyImageData(layout: CONSTRAINED, width: 800, height: 1200)
        }
      }
    }
    fullWidthImage: unsplashImagesYaml(title: { eq: "Tennis court" }) {
      credit
      title
      localFile {
        childImageSharp {
          gatsbyImageData(width: 600, layout: CONSTRAINED)
        }
      }
    }
  }
`
