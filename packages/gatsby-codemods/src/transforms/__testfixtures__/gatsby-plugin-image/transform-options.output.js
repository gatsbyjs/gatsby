import React from "react"
import { graphql } from "gatsby"

export const query = graphql`{
  file(relativePath: {eq: "icon.png"}) {
    childImageSharp {
      gatsbyImageData(
        transformOptions: {duotone: {highlight: "#f00e2e", shadow: "#192550"}, rotate: 50}
        layout: FULL_WIDTH
      )
    }
  }
}`
