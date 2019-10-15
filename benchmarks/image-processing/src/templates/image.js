import React from "react"
import { Link, graphql } from "gatsby"
import Img from "gatsby-image"

export default props => (
  <div>
    <Link to="/">Home</Link>
    <br />
    <Img fixed={props.data.remoteImage.file.childImageSharp.fixed} />
  </div>
)

export const query = graphql`
  query($id: String!) {
    remoteImage(id: { eq: $id }) {
      id
      file {
        childImageSharp {
          fixed(width: 500, height: 500) {
            ...GatsbyImageSharpFixed
          }
        }
      }
    }
  }
`
