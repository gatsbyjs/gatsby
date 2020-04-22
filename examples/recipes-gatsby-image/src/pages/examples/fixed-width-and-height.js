import React from "react"
import { useStaticQuery, graphql } from "gatsby"
import Img from "gatsby-image"

import Layout from "../../components/layout"

export default () => {
  const data = useStaticQuery(graphql`
    query {
      file(relativePath: { eq: "corgi.jpg" }) {
        childImageSharp {
          fixed(width: 250, height: 250) {
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
        fixed={data.file.childImageSharp.fixed}
        alt="A corgi smiling happily"
      />
    </Layout>
  )
}
