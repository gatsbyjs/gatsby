import React from "react"
import Link from "gatsby-link"
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
      image,
      brand,
      categories,
    } = product
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
              src={image[0].file.url}
            />
          </div>
          <div style={{ display: `flex`, flexDirection: `column` }}>
            <h4 style={{ marginBottom: 0 }}>{productName}</h4>
          </div>
        </div>
        <h1>{productName}</h1>
        <h4>Made by {brand.companyName}</h4>
        <div>
          <span>Price: ${price}</span>
          <div dangerouslySetInnerHTML={{ __html: productDescription }} />
          <div>
            <span>See other: </span>
            <ul>
              { categories.map((category, i) =>
                  <li key={i}>
                    <Link key={i} to={`/categories/${category.id}`}>{category.title}</Link>
                  </li>
              )}
            </ul>
          </div>
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
        file {
          url
        }
      }
      brand {
        companyName
      }
      categories {
        id
        title
      }
    }
  }
`
