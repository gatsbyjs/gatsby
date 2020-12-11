import React from "react"
import { GatsbyImage } from "gatsby-plugin-image";

const Image = () => {

  if (!data?.placeholderImage?.childImageSharp?.gatsbyImageData) {
    return <div>Picture not found</div>
  }

  return <GatsbyImage image={data?.placeholderImage?.childImageSharp?.gatsbyImageData} />;
}

export default Image