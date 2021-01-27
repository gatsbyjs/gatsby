import React from "react"
import { graphql } from "gatsby"
import { GatsbyImage, getImage, useArtDirection } from "gatsby-plugin-image"

import PageTitle from "../components/page-title"
import Layout from "../components/layout"

import "./art-direction.css"

const PreferWebp = ({ data, location }) => {
  const images = useArtDirection(getImage(data.floatingImage.localFile), [
    {
      media: "(max-width: 1024px)",
      image: getImage(data.floatingImageMobile.localFile),
    },
  ])

  console.log(images)
  return (
    <Layout
      location={location}
      image={getImage(data.coverImage.localFile)}
      imageTitle={`“${data.coverImage.title}” by ${data.coverImage.credit} (via unsplash.com)`}
    >
      <PageTitle>Prefer WebP</PageTitle>
      <GatsbyImage
        className="art-directed"
        image={images}
        title={`“${data.fullWidthImage.title}” by ${data.fullWidthImage.credit} (via unsplash.com)`}
      />
      <p>
        WebP is a modern image format that provides both lossless and lossy
        compression for images on the web. This format can reduce the filesize
        considerably compared to JPG and PNG files, and using it is pretty easy
        with <strong>gatsby-image</strong> and{` `}
        <strong>gatsby-plugin-sharp</strong>.
      </p>
      <p>
        The <strong>WebP</strong> technique is similar to other gatsby-image
        techniques in that it can be applied in image queries with GraphQL. To
        specify that an image should be loaded in the WebP format in supporting
        browsers, use a fragment with <code>withWebp</code> at the end.
      </p>
      <p />
    </Layout>
  )
}

export default PreferWebp

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
