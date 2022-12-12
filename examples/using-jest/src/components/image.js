import * as React from "react"
import { graphql, useStaticQuery } from "gatsby"
import { GatsbyImage } from "gatsby-plugin-image"

const Image = () => {
  const data = useStaticQuery(graphql`
    query {
      placeholderImage: file(relativePath: { eq: "gatsby-astronaut.png" }) {
        childImageSharp {
          gatsbyImageData(width: 300)
        }
      }
    }
  `)

  return <GatsbyImage image={data.placeholderImage.childImageSharp.gatsbyImageData} alt="Gatsby Astronaut" />
}

export default Image
