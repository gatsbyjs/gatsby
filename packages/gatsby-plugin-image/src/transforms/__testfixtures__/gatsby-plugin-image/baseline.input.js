import React from "react"
import { graphql } from "gatsby"
import Img from "gatsby-image"

<Img fixed={data.file.childImageSharp.fixed} alt="headshot"/>

export const query = graphql`
{
  file(relativePath: { eq: "headers/default.jpg" }) {
    childImageSharp {
      fixed(width: 125, height: 125) {
        ...GatsbyImageSharpFixed
      }
    }
  }
}
`