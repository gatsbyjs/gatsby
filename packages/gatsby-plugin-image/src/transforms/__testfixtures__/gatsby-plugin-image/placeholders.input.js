import React from "react"
import { graphql } from "gatsby"
import Image from "gatsby-image"

<Image fixed={data.file.childImageSharp.fluid} alt="headshot"/>


export const query = graphql`{
  file(relativePath: {eq: "landscape.jpg"}) {
    image {
      childImageSharp {
        fluid {
          ...GatsbyImageSharpFluid_tracedSVG
          }
        }
      }
    }
  }
`