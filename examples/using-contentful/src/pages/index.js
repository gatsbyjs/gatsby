import React from "react"
import Link from "gatsby-link"
import * as PropTypes from "prop-types"

const propTypes = {
  data: PropTypes.object.isRequired,
}

class IndexPage extends React.Component {
  render() {
    const productEdges = this.props.data.allContentfulProduct.edges
    const assetEdges = this.props.data.allContentfulAsset.edges
    // Not ideal, but brute force method works..
    const imageUrls = productEdges.map(productEdge => {
      const assetEdge = assetEdges.find(assetEdge => assetEdge.node.id === productEdge.node.image[0].sys.id)
      return assetEdge && assetEdge.node.file.url
    })
    return (
      <div>
        {productEdges.map((productEdge, i) => {
          const product = productEdge.node
          return (
            <div key={product.id}>
              <Link to={`/node/${product.id}/`}>
                <h4>{product.productName}</h4>
                <img src={imageUrls[i]}/>
              </Link>
            </div>
          )
        })}
      </div>
    )
  }
}

IndexPage.propTypes = propTypes

export default IndexPage

export const pageQuery = graphql`
query PageQuery {
  allContentfulProduct {
    edges {
      node {
        id
        productName
        image {
          sys {
            id
          }
        }
      }
    }
  }
  allContentfulAsset {
    edges {
      node {
        id
        file {
          url
        }
      }
    }
  }
}
`
