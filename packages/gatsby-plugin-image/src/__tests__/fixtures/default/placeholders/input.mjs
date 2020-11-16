import React from "react"
import { graphl } from "gatsby"
import Image from "gatsby-image"

<Image fixed={data.file.childImageSharp.fluid} alt="headshot"/>


export const query = graphql`
  {
    allProjectsYaml(sort: { fields: [index], order: DESC }) {
      nodes {
        name
        url
        image {
          childImageSharp {
            fluid {
              ...GatsbyImageSharpFluid_tracedSVG
            }
          }
        }
        technologies
      }
    }
  }
`