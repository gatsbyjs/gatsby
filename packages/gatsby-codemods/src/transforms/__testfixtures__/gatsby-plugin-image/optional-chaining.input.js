import React from "react"
import Img from "gatsby-image"

const Image = () => {

  if (!data?.placeholderImage?.childImageSharp?.fluid) {
    return <div>Picture not found</div>
  }

  return <Img fluid={data?.placeholderImage?.childImageSharp?.fluid} />
}

export default Image