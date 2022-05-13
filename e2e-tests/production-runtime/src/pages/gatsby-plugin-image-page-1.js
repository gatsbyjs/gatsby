import { graphql } from "gatsby"
import React from "react"

import { GatsbyImage } from "gatsby-plugin-image"

const PluginImage = ({ data }) => {
  const images = data.allMyRemoteFile.nodes
  const [nodeIndex, updateNode] = React.useState(0)

  return (
    <div>
      <h1>Image Testing</h1>

      <div id="image-wrapper">
        <GatsbyImage
          image={data.allMyRemoteFile.nodes[nodeIndex].fixed}
          alt="fixed"
          backgroundColor="rebeccapurple"
        />
      </div>

      <button
        id="click"
        onClick={() =>
          updateNode(nodeIndex === images.length - 1 ? 0 : nodeIndex + 1)
        }
      >
        Change Image
      </button>
    </div>
  )
}

export const pageQuery = graphql`
  {
    allMyRemoteFile {
      nodes {
        id
        fixed: gatsbyImage(layout: FIXED, width: 100, placeholder: NONE)
      }
    }
  }
`

export default PluginImage
