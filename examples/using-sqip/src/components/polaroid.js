import React from 'react'
import PropTypes from 'prop-types'

import Image from 'gatsby-image'

// Styling based on https://codepen.io/havardob/pen/ZOOmMe

const data = {
  'alisa-anton-166247-unsplash-2000px': {
    style: { left: `6vw`, bottom: `6vw` },
    author: `Alisa Anton`,
    url: `https://unsplash.com/photos/ukxAK0c2FqM`,
  },
  'anthony-esau-173126-unsplash-2000px': {
    style: { left: `30vw`, bottom: `12vw` },
    author: `Anthony Esau`,
    url: `https://unsplash.com/photos/N2zk9yXjmLA`,
  },
  'beth-solano-313648-unsplash-2000px': {
    style: { left: `39vw`, top: `3vw` },
    author: `Beth Solando`,
    url: `https://unsplash.com/photos/VGkn9ENxLXM`,
  },
  'desmond-simon-412494-unsplash-2000px': {
    style: { right: `5vw`, bottom: `5vw` },
    author: `Desmond Simon`,
    url: `https://unsplash.com/photos/HhOo98Iygps`,
  },
  'igor-ovsyannykov-307432-unsplash-2000px': {
    style: { right: `27vw`, bottom: `3vw` },
    author: `Igor Ovsyannykov`,
    url: `https://unsplash.com/photos/uzd2UEDdQJ8`,
  },
  'quino-al-101314-unsplash-2000px': {
    style: { right: `28vw`, bottom: `27vw` },
    author: `Quino Al`,
    url: `https://unsplash.com/photos/vBxlL1xpSdc`,
  },
  'samuel-zeller-16570-unsplash-2000px': {
    style: { right: `16vw`, top: `2vw` },
    author: `Samuel Zeller`,
    url: `https://unsplash.com/photos/CwkiN6_qpDI`,
  },
  'tyler-lastovich-205631-unsplash-2000px': {
    style: { right: `3vw`, top: `14vw` },
    author: `Tyler Lastovich`,
    url: `https://unsplash.com/photos/DMJUIGRO_1M`,
  },
}

function generateStyle(imageData) {
  const rotation = Math.floor(Math.random() * 26) - 13
  return {
    boxSizing: `content-box`,

    display: `block`,
    position: `absolute`,

    width: `18vw`,

    padding: `0.8vw 0.4vw 0`,
    background: `linear-gradient(120deg, #fff, #eee 60%)`,

    color: `inherit`,

    boxShadow: `2px 2px 7px 0px rgba(0,0,0,0.4), rgba(0, 0, 0, 0.1) 1px 1px 3px 0px inset`,
    transform: `rotate(${rotation}deg)`,

    ...imageData.style,
  }
}

const Polaroid = ({ image }) => {
  const imageData = data[image.name]

  return (
    <a
      href={imageData.url}
      title={`by ${imageData.author}`}
      style={generateStyle(imageData)}
    >
      <div style={{ position: `relative` }}>
        <Image
          sizes={{
            ...image.childImageSharp.sizes,
            base64: image.childImageSharp.sqip.dataURI,
          }}
        />
        <div
          style={{
            position: `absolute`,
            top: 0,
            left: 0,
            background: `linear-gradient(120deg, rgba(255, 255, 255, 0.5), transparent 60%, rgba(0, 0, 0, 0.4) 99%)`,
            boxShadow: `inset 4px 5px 10px 0 rgba(0,0,0,0.05)`,
            width: `100%`,
            height: `100%`
          }}
        />
      </div>
      <div
        style={{
          lineHeight: `4vw`,
          textAlign: `center`,
          fontSize: `1.6vw`,
        }}
      >{`📷 ${imageData.author}`}</div>
    </a>
  )
}

Polaroid.propTypes = {
  image: PropTypes.object,
}

export default Polaroid
