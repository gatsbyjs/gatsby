import React from 'react'
import PropTypes from 'prop-types'
import Image from 'gatsby-image'

import Polaroid from '../components/polaroid'

import './index.css'

const Layout = ({ children, data }) => {
  const images = data.images.edges.map(image => (
    <Polaroid image={image.node} key={image.node.name} />
  ))
  const background = data.background.edges[0].node
  return (
    <div>
      <div
        style={{
          position: `relative`,
          height: `66vw`,
          zIndex: 0,
        }}
      >
        <Image
          // Inject the sqip dataURI as base64 value
          sizes={{
            ...background.childImageSharp.sizes,
            base64: background.childImageSharp.sqip.dataURI,
          }}
          alt={background.name}
        />
        <div>{images}</div>
      </div>
      <div style={{ padding: `5vw` }}>{children()}</div>
    </div>
  )
}

Layout.propTypes = {
  children: PropTypes.object,
  data: PropTypes.object,
}

export default Layout

export const query = graphql`
  query SiteTitleQuery {
    images: allFile(
      filter: { sourceInstanceName: { eq: "images" }, ext: { eq: ".jpg" } }
    ) {
      edges {
        node {
          publicURL
          name
          childImageSharp {
            sizes(maxWidth: 400, maxHeight: 400) {
              ...GatsbyImageSharpSizes_noBase64
            }
            sqip(
              # Make sure to keep the same aspect ratio when cropping
              # With 256px as maximum dimension is the perfect value to speed up the process
              width: 256
              height: 256
              numberOfPrimitives: 15
              blur: 8
              mode: 1
            ) {
              dataURI
            }
          }
        }
      }
    }
    background: allFile(
      filter: { sourceInstanceName: { eq: "background" }, ext: { eq: ".jpg" } }
    ) {
      edges {
        node {
          publicURL
          name
          childImageSharp {
            sizes(maxWidth: 4000) {
              ...GatsbyImageSharpSizes_noBase64
            }
            sqip(numberOfPrimitives: 160, blur: 0) {
              dataURI
            }
          }
        }
      }
    }
  }
`
