import React from "react"
import { useStaticQuery, graphql } from "gatsby"
import Img from "gatsby-image"

import Layout from "../../components/layout"

/*
  1. make sure folders are sourced (add folder to images called dogs)
  2. write a query to get images, filter
  3. loop through images
*/

export default () => {
  const allImagesQuery = graphql`
    query {
      allFile(
        filter: {
          extension: { regex: "/(jpg)|(png)|(jpeg)/" }
          relativeDirectory: { eq: "dogs" }
        }
      ) {
        edges {
          node {
            base
            childImageSharp {
              fluid {
                base64
                aspectRatio
                src
                srcSet
                sizes
              }
            }
          }
        }
      }
    }
  `
  const {
    allFile: { edges: images },
  } = useStaticQuery(allImagesQuery)

  return (
    <Layout>
      {images.map((image, index) => (
        <Img
          key={index}
          fluid={image.node.childImageSharp.fluid}
          alt={image.node.base.split(`.`)[0]}
        />
      ))}
    </Layout>
  )
}
