import React from "react"
import { graphql } from "gatsby"
import Image from "gatsby-image"

<Image fluid={data.file.childImageSharp.fluid} alt="headshot"/>


export const query = graphql`query {
  named: file(relativePath: {eq: "landscape.jpg"}) {
    childImageSharp {
      fluid {
        ...GatsbyImageSharpFluid_tracedSVG
        }
      }
    }
  }
`