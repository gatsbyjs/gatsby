import React from "react"
import { graphql } from "gatsby"
import { GatsbyImage } from "gatsby-plugin-image";

<GatsbyImage image={data.file.childImageSharp.gatsbyImageData} alt="headshot" />

export const query = graphql`{
  file(relativePath: {eq: "headers/default.jpg"}) {
    childImageSharp {
      gatsbyImageData(width: 125, height: 125, layout: FIXED)
    }
  }
}`
