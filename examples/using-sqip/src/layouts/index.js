import React from 'react'
import PropTypes from 'prop-types'
import Image from 'gatsby-image'

import './index.css'

const imageData = {
  'alisa-anton-166247-unsplash-2000px': {
    css: { left: `6vw`, bottom: `6vw`, transform: `rotate(-7deg)` },
  },
  'anthony-esau-173126-unsplash-2000px': {
    css: { left: `30vw`, bottom: `12vw`, transform: `rotate(3deg)` },
  },
  'beth-solano-313648-unsplash-2000px': {
    css: { left: `39vw`, top: `3vw`, transform: `rotate(-13deg)` },
  },
  'desmond-simon-412494-unsplash-2000px': {
    css: { right: `5vw`, bottom: `9vw`, transform: `rotate(19deg)` },
  },
  'igor-ovsyannykov-307432-unsplash-2000px': {
    css: { right: `27vw`, bottom: `7vw`, transform: `rotate(4deg)` },
  },
  'quino-al-101314-unsplash-2000px': {
    css: { right: `28vw`, bottom: `27vw`, transform: `rotate(5deg)` },
  },
  'samuel-zeller-16570-unsplash-2000px': {
    css: { right: `16vw`, top: `2vw`, transform: `rotate(1deg)` },
  },
  'tyler-lastovich-205631-unsplash-2000px': {
    css: { right: `3vw`, top: `16vw`, transform: `rotate(-9deg)` },
  },
}

const Layout = ({ children, data }) => {
  const images = data.images.edges.map(image => (
    <div
      key={image.node.name}
      style={{
        ...imageData[image.node.name].css,
        position: `absolute`,
        border: `0.75vw solid white`,
        width: `18vw`,
        boxSizing: `content-box`,
        boxShadow: `rgba(33, 33, 33, 0.33) 1px 1px 3px`,
      }}
    >
      <Image
        sizes={{
          ...image.node.childImageSharp.sizes,
          base64: image.node.childImageSharp.sqip.dataURI,
        }}
      />
    </div>
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
          sizes={{
            ...background.childImageSharp.sizes,
            base64: background.childImageSharp.sqip.dataURI,
          }}
          alt={background.name}
        />
        <div>{images}</div>
      </div>
      <div style={{ padding: `5vw` }}>
        <h1>Gatsby SQIP Example</h1>
        <p>@todo add description</p>
      </div>
    </div>
  )
}

Layout.propTypes = {
  data: PropTypes.object,
}

export default Layout

export const query = graphql`
  query SiteTitleQuery {
    site {
      siteMetadata {
        title
      }
    }
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
              width: 400
              height: 400
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
            sqip(width: 4000, numberOfPrimitives: 160, blur: 0) {
              dataURI
            }
          }
        }
      }
    }
  }
`
