import React from 'react'
import {rhythm} from 'utils/typography'
import Link from 'react-router/lib/Link'

const ImageIndex = (props) => {
  return (
    <div>
      {props.data.allImages.edges.map((edge) => {
        const {regular, retina} = edge.node
        return (
          <Link
            to={edge.node.path}
            key={edge.node.path}
          >
            <img
              src={regular.src}
              srcSet={`${retina.src} 2x`}
              style={{
                display: 'inline',
                marginRight: rhythm(1/2),
                marginBottom: rhythm(1/2),
                height: regular.height,
                width: regular.width,
                verticalAlign: 'middle',
              }}
            />
          </Link>
        )
      })}
    </div>
  )
}

export default ImageIndex

export const pageQuery = `
query allImages {
  allImages {
    edges {
      node {
        path
        regular: image(height: 290, width: 387) {
          src
          height
          width
        }
        retina: image(height: 580, width: 794) {
          src
        }
      }
    }
  }
}
`
