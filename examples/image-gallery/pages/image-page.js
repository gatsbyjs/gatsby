import React from 'react'
import { rhythm } from 'utils/typography'

class ImagePage extends React.Component {
  constructor () {
    super()
    this.state = {
      loaded: false,
    }
  }

  render () {
    const {regular, retina, micro} = this.props.data.image
    return (
      <div>
        <p>{this.props.data.image.FileName}</p>
        <img
          src={`data:image/jpeg;base64,${micro.src}`}
          style={{
            width: regular.width,
            height: regular.height,
            position: 'absolute',
            transition: 'opacity 0.5s',
            opacity: this.state.loaded ? 0 : 1,
          }}
        />
        <img
          src={regular.src}
          onLoad={() => this.setState({ loaded: true })}
          srcSet={`${retina.src} 2x`}
        />
      </div>
    )
  }
}

export default ImagePage

export const pageQuery = `
  query ImagePage($path: String!) {
    image(path: $path) {
      FileName
      micro: image(width: 20, base64: true) {
        src
      }
      regular: image(width: 1000) {
        src
        width
        height
      }
      retina: image(width: 2000) {
        src
      }
    }
  }
`
