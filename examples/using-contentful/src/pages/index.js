import React from "react"
import Link from "gatsby-link"
import * as PropTypes from "prop-types"

const propTypes = {
  data: PropTypes.object.isRequired,
}

class IndexPage extends React.Component {
  render() {
    const productEdges = this.props.data.allContentfulProduct.edges
    return (
      <div>
        {productEdges.map((productEdge, i) => {
          const product = productEdge.node
          return (
            <div key={product.id}>
              <Link to={`/products/${product.id}/`}>
                <h4>
                  {
                    product.childContentfulProductProductNameTextNode
                      .productName
                  }
                </h4>
                {product.image[0].file.url &&
                  <img src={product.image[0].file.url} />}
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
        childContentfulProductProductNameTextNode { productName }
        image {
          file {
            url
          }
        }
      }
    }
  }
}
`
