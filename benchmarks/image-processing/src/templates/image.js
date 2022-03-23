import { Link, graphql } from "gatsby"
import { GatsbyImage } from "gatsby-plugin-image"
import * as React from "react"

export default props => (
  <div>
    <Link to="/">Home</Link>
    <br />
    <GatsbyImage
      image={props.data.remoteImage.file.childImageSharp.gatsbyImageData}
    />
  </div>
)

export const query = graphql`
  query ($id: String!) {
    remoteImage(id: { eq: $id }) {
      id
      file {
        childImageSharp {
          gatsbyImageData(width: 300, layout: FIXED)
        }
      }
    }
  }
`
