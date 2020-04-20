import * as React from "react"
import PropTypes from "prop-types"
import Image from "gatsby-image"
import Polaroid from "../components/polaroid"

import "../index.css"

const Layout = ({ children, data }) => {
  const images = data.images.edges.map(image => (
    <Polaroid image={image.node} key={image.node.name} />
  ))

  const background = data.background.edges[0].node
  return (
    <React.Fragment>
      <div
        style={{
          position: `relative`,
          height: `66vw`,
          zIndex: 0,
        }}
      >
        <Image
          // Inject the sqip dataURI as base64 value
          fluid={{
            ...background.childImageSharp.fluid,
            base64: background.childImageSharp.sqip.dataURI,
          }}
          alt={background.name}
        />
        <div>{images}</div>
      </div>
      <div style={{ padding: `5vw` }}>{children}</div>
    </React.Fragment>
  )
}

export default Layout

Layout.propTypes = {
  children: PropTypes.node,
  data: PropTypes.object,
}
