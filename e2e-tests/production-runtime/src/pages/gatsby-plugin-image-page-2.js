import { graphql } from "gatsby"
import React from "react"

import { GatsbyImage } from "gatsby-plugin-image"

const PluginImage = ({ data }) => {
  const [bg, updateBg] = React.useState("rebeccapurple")

  return (
    <div>
      <h1>Image Testing</h1>

      <div id="image-wrapper">
        <GatsbyImage
          image={data.allMyRemoteFile.nodes[0].fixed}
          alt="fixed"
          backgroundColor={bg}
        />
      </div>

      <button
        id="click"
        onClick={() =>
          updateBg(bg === "rebeccapurple" ? "red" : "rebeccapurple")
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
