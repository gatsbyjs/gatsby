import React from "react"
import { graphql } from "gatsby"
import Img from "gatsby-image"

<Img fixed={data.file.childImageSharp.fixed} alt="headshot"/>

export const query = graphql`
{
  file(relativePath: { eq: "headers/default.jpg" }) {
    childImageSharp {
      fluid(maxWidth: 1000, maxHeight: 500) {
        ...GatsbyImageSharpFluid
      }
    }
  }
  other: file(relativePath: { eq: "headers/default.jpg" }) {
    childImageSharp {
      fluid(maxWidth: 500) {
        ...GatsbyImageSharpFluid
      }
    }
  }
}
`