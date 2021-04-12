import React from "react"
import { graphql } from "gatsby"
import { GatsbyImage, getImage } from "gatsby-plugin-image"
import ImageGallery from "../components/image-gallery"
import PageTitle from "../components/page-title"
import Layout from "../components/layout"

const DominantColor = ({ data, location }) => (
  <Layout
    location={location}
    image={getImage(data.coverImage.localFile)}
    imageTitle={`“${data.coverImage.title}” by ${data.coverImage.credit} (via unsplash.com)`}
  >
    <PageTitle>Dominant Color Placeholders</PageTitle>
    <GatsbyImage
      image={getImage(data.floatingImage.localFile)}
      alt={`“${data.floatingImage.title}” by ${data.floatingImage.credit} (via unsplash.com)`}
    />
    <p>
      The default Dominant color technique uses progressive loading to make a
      fast, visually pleasing experience without waiting for a full-resolution
      image with a blank screen.
    </p>
    <h2>Progressive Loading with Minimal Effort</h2>
    <p>
      Dominant color creates a properly sized div with a background color
      generated based on your specific image. When the page loads, the div will
      load first for quick display while the larger image file is downloaded and
      displayed. This provides a nice visual effect and improves page
      performance while removing the need for layout shifts when the image
      loads.
    </p>
    <p>
      This technique is the default behavior when querying for an image with
      GraphQL or using StaticImage.
    </p>
    <h2>Unsplash Dominant Color Gallery</h2>
    <ImageGallery images={data.galleryImagesCropped.edges} />
    <GatsbyImage
      image={getImage(data.fullWidthImage.localFile)}
      alt={`“${data.fullWidthImage.title}” by ${data.fullWidthImage.credit} (via unsplash.com)`}
    />
  </Layout>
)

export default DominantColor

export const query = graphql`
  {
    coverImage: unsplashImagesYaml(title: { eq: "Plant with leaves" }) {
      credit
      title
      localFile {
        childImageSharp {
          gatsbyImageData(
            width: 720
            aspectRatio: 0.5
            placeholder: DOMINANT_COLOR
            layout: CONSTRAINED
          )
        }
      }
    }
    floatingImage: unsplashImagesYaml(title: { eq: "Pug without hoodie" }) {
      credit
      title
      localFile {
        childImageSharp {
          gatsbyImageData(
            width: 200
            placeholder: DOMINANT_COLOR
            layout: CONSTRAINED
          )
        }
      }
    }
    fullWidthImage: unsplashImagesYaml(title: { eq: "City from above" }) {
      credit
      title
      localFile {
        childImageSharp {
          gatsbyImageData(
            width: 480
            placeholder: DOMINANT_COLOR
            layout: CONSTRAINED
          )
        }
      }
    }
    galleryImagesCropped: allUnsplashImagesYaml(
      filter: { gallery: { eq: true } }
      skip: 10
    ) {
      edges {
        node {
          credit
          title
          localFile {
            childImageSharp {
              gatsbyImageData(
                width: 380
                height: 380
                quality: 70
                placeholder: DOMINANT_COLOR
                layout: CONSTRAINED
              )
            }
          }
        }
      }
    }
  }
`
