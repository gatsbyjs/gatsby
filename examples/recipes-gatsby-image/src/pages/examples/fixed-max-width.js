import React from "react"
import { useStaticQuery, graphql } from "gatsby"
import Img from "gatsby-image"

import Layout from "../../components/layout"

/*
  1. write a query for sourced images
  2. be sure to query for the fixed field
  3. add a style prop to the Img component
*/

export default () => {
  const data = useStaticQuery(graphql`
    query {
      file(relativePath: { eq: "corgi.jpg" }) {
        childImageSharp {
          fixed {
            base64
            width
            height
            src
            srcSet
          }
        }
      }
    }
  `)

  return (
    <Layout>
      <Img
        style={{ maxWidth: 250 }}
        fixed={data.file.childImageSharp.fixed}
        alt="A corgi smiling happily"
      />
    </Layout>
  )
}
