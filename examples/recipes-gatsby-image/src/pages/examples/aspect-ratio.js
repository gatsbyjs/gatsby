import React from "react"
import { useStaticQuery, graphql } from "gatsby"
import Img from "gatsby-image"

import Layout from "../../components/layout"

/*
  1. write a query to get image
  2. spread the returned object  into the fluid prop and override the aspectRatio
*/

export default () => {
  const data = useStaticQuery(graphql`
    query {
      file(relativePath: { eq: "corgi.jpg" }) {
        childImageSharp {
          fluid {
            base64
            aspectRatio # returns the images aspectRatio
            src
            srcSet
            sizes
          }
        }
      }
    }
  `)

  return (
    <Layout>
      <Img
        fluid={{
          ...data.file.childImageSharp.fluid,
          aspectRatio: 1, // override the original returned aspectRatio
        }}
        alt="A corgi smiling happily"
      />
    </Layout>
  )
}
