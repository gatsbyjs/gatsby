import React from "react"
import { graphql } from "gatsby"
import { GatsbyImage } from "gatsby-plugin-image";

<div>
  <GatsbyImage image={data.file.childImageSharp.gatsbyImageData} alt="headshot" />

  <GatsbyImage image={data.banner.childImageSharp.gatsbyImageData} alt="headshot" />
</div>

export const query = graphql`{
  file(relativePath: {eq: "headers/headshot.jpg"}) {
    childImageSharp {
      gatsbyImageData(layout: FULL_WIDTH)
    }
  }
  banner: file(relativePath: {eq: "headers/default.jpg"}) {
    childImageSharp {
      gatsbyImageData(placeholder: TRACED_SVG, layout: CONSTRAINED)
    }
  }
}`
