import React from "react"
import { graphql } from "gatsby"
import { GatsbyImage, getImage } from "gatsby-plugin-image"

import PageTitle from "../components/page-title"
import ImageGallery from "../components/image-gallery"

import Layout from "../components/layout"

const TracedSVG = ({ data, location }) => (
  <Layout
    location={location}
    image={getImage(data.coverImage.localFile)}
    imageTitle={`“${data.coverImage.title}” by ${data.coverImage.credit} (via unsplash.com)`}
  >
    <PageTitle>Traced SVG Placeholders</PageTitle>
    <GatsbyImage
      image={getImage(data.floatingImage.localFile)}
      alt={`“${data.floatingImage.title}” by ${data.floatingImage.credit} (via unsplash.com)`}
    />
    <p>
      Generates a{` `}
      <a href="https://github.com/gatsbyjs/gatsby/issues/2435">traced SVG</a> of
      the image and returns the SVG source as an ”optimized URL-encoded” data:
      URI. This provides an alternative to the default inline base64 placeholder
      image.
    </p>
    <p>
      To make use of this technique, pass <code>placeholder: TRACED_SVG</code>{" "}
      to the resolver, or <code>placeholder="tracedSVG"</code> with the
      StaticImage component.
    </p>
    <h2>Unsplash SVG Image Gallery</h2>
    <ImageGallery images={data.galleryImagesCropped.edges} />
    <GatsbyImage
      image={getImage(data.fullWidthImage.localFile)}
      alt={`“${data.fullWidthImage.title}” by ${data.fullWidthImage.credit} (via unsplash.com)`}
    />
  </Layout>
)

export default TracedSVG

export const query = graphql`
  {
    coverImage: unsplashImagesYaml(title: { eq: "Polaroid Pronto 600" }) {
      credit
      title
      localFile {
        childImageSharp {
          gatsbyImageData(
            width: 720
            tracedSVGOptions: { background: "#fff", color: "#663399" }
            transformOptions: { cropFocus: CENTER }
            placeholder: TRACED_SVG
            aspectRatio: 0.5
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
            placeholder: TRACED_SVG
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
            placeholder: TRACED_SVG
            layout: CONSTRAINED
          )
        }
      }
    }
    galleryImages: allUnsplashImagesYaml(
      filter: { gallery: { eq: true } }
      limit: 10
    ) {
      edges {
        node {
          credit
          title
          localFile {
            childImageSharp {
              gatsbyImageData(
                width: 380
                quality: 70
                tracedSVGOptions: { background: "#fbfafc", color: "#dbd4e2" }
                placeholder: TRACED_SVG
                layout: CONSTRAINED
              )
            }
          }
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
                tracedSVGOptions: { background: "#fbfafc", color: "#dbd4e2" }
                placeholder: TRACED_SVG
                layout: CONSTRAINED
              )
            }
          }
        }
      }
    }
  }
`
