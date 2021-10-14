import React from "react"
import { useStaticQuery, graphql } from "gatsby"
import Img from "gatsby-image"

import Layout from "../../components/layout"

/*
  1. write query
  2. pass data into img component
*/

export default () => {
  const data = useStaticQuery(graphql`
    query {
      file(relativePath: { eq: "corgi.jpg" }) {
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
  `)

  return (
    <Layout>
      <Img
        style={{ border: `2px solid rebeccapurple`, borderRadius: 5 }}
        fluid={data.file.childImageSharp.fluid}
        alt="A corgi smiling happily"
      />
    </Layout>
  )
}
