import React from 'react'
import { rhythm } from 'utils/typography'

const ImagePage = (props) => {
  console.log(props)
  const {regular, retina} = props.data.image
  return (
    <div>
      <p>{props.data.image.FileName}</p>
      <img
        src={regular.src}
        srcSet={`${retina.src} 2x`}
        style={{
          display: 'inline',
          marginRight: rhythm(1/2),
          marginBottom: rhythm(1/2),
          verticalAlign: 'middle',
        }}
      />
    </div>
  )
}

export default ImagePage

export const pageQuery = `
  query ImagePage($path: String!) {
    image(path: $path) {
      FileName
      regular: image(width: 1000) {
        src
      }
      retina: image(width: 2000) {
        src
      }
    }
  }
`
