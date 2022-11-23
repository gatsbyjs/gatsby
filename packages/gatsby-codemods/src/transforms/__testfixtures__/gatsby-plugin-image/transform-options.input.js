import React from "react"
import { graphql } from "gatsby"

export const query = graphql`
{
  file(relativePath: {eq: "icon.png"}) {
    childImageSharp {
      fluid(duotone: {highlight: "#f00e2e", shadow: "#192550"}, rotate: 50) {
        ...GatsbyImageSharpFluid
      }
    }
  }
}
`