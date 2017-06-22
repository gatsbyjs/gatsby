import React from "react"
import Link from "gatsby-link"
import * as PropTypes from "prop-types"
import { rhythm } from "../utils/typography"

const propTypes = {
  data: PropTypes.object.isRequired,
}

class IndexPage extends React.Component {
  render() {
    const productEdges = this.props.data.allContentfulProduct.edges
    return (
      <div style={{ marginBottom: rhythm(2) }}>
        <h1>Products</h1>
        {productEdges.map((productEdge, i) => {
          const product = productEdge.node
          return (
            <div key={product.id}>
              <Link
                style={{ color: `inherit`, textDecoration: `none` }}
                to={`/products/${product.id}/`}
              >
                <div
                  style={{
                    display: `flex`,
                    alignItems: `center`,
                    borderBottom: `1px solid lightgray`,
                    paddingBottom: rhythm(1 / 2),
                    marginBottom: rhythm(1 / 2),
                  }}
                >
                  <div style={{ marginRight: rhythm(1 / 2) }}>
                    {product.image[0].responsiveResolution.src &&
                      <img
                        style={{ margin: 0 }}
                        width={product.image[0].responsiveResolution.width}
                        height={product.image[0].responsiveResolution.height}
                        src={product.image[0].responsiveResolution.src}
                        srcSet={product.image[0].responsiveResolution.srcSet}
                      />}
                  </div>
                  <div style={{ flex: 1 }}>
                    {product.productName.productName}
                  </div>
                </div>
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
        productName { productName }
        image {
          responsiveResolution(width: 75) {
            src
            srcSet
            height
            width
          }
        }
      }
    }
  }
}
`
