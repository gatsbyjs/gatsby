import React from "react"
import * as PropTypes from "prop-types"

import { rhythm } from "../utils/typography"

const propTypes = {
  data: PropTypes.object.isRequired,
}

class ProductTemplate extends React.Component {
  render() {
    const product = this.props.data.contentfulProduct
    const {
      productName,
      productDescription,
      price,
    } = product
    const assetEdges = this.props.data.allContentfulAsset.edges
    // Not ideal, but brute force method works..
    const assetEdge = assetEdges.find(assetEdge => assetEdge.node.id === product.image[0].sys.id)
    const imageUrl = assetEdge && assetEdge.node.file.url
    return (
      <div>
        <div style={{ display: `flex`, marginBottom: rhythm(1 / 2) }}>
          <div style={{ height: rhythm(2), width: rhythm(2) }}>
            <img
              style={{
                height: `auto`,
                width: `auto`,
                maxWidth: rhythm(2),
                maxHeight: rhythm(2),
                marginRight: rhythm(1 / 2),
              }}
              src={imageUrl}
            />
          </div>
          <div style={{ display: `flex`, flexDirection: `column` }}>
            <h4 style={{ marginBottom: 0 }}>{productName}</h4>
          </div>
        </div>
        <h1>{productName}</h1>
        <div>
          <span>Price: ${price}</span>
          <div dangerouslySetInnerHTML={{ __html: productDescription }} />
        </div>
      </div>
    )
  }
}

ProductTemplate.propTypes = propTypes

export default ProductTemplate

export const pageQuery = graphql`
  query productQuery($id: String!) {
    contentfulProduct(id: { eq: $id }) {
      productName
      productDescription
      price
      image {
        sys {
          id
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
