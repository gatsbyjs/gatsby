import React from "react"
import { graphl } from "gatsby"
import Img from "gatsby-image"

<Img 
fixed={data.file.childImageSharp.fixed}
 alt="headshot"/>

export const query = graphql`
  query {
    file(relativePath: { eq: "headers/headshot.jpg" }) {
      childImageSharp {
        # Specify the image processing specifications right in the query.
        # Makes it trivial to update as your page's design changes.
        fluid {
          ...GatsbyImageSharpFluid_withWebp
        }
      }
    }
    banner: file(relativePath: { eq: "headers/default.jpg" }) {
      childImageSharp {
        # Specify the image processing specifications right in the query.
        # Makes it trivial to update as your page's design changes.
        fluid {
          ...GatsbyImageSharpFluid_withWebp_tracedSVG
          ...GatsbyImageSharpFluidLimitPresentationSize
        }
      }
    }
  }
`