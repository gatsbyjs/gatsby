import React from "react"
import Link from "gatsby-link"
import * as PropTypes from "prop-types"

import { rhythm } from "../utils/typography"

const propTypes = {
  data: PropTypes.object.isRequired,
}

class CategoryTemplate extends React.Component {
  render() {
    const category = this.props.data.contentfulCategory
    const { title, product, icon } = category
    const imageUrl = icon.file.url
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
            <h4 style={{ marginBottom: 0 }}>{title}</h4>
          </div>
        </div>
        <h1>{title}</h1>
        <div>
          <span>Products</span>
          <ul>
            {product &&
              product.map((p, i) =>
                <li key={i}>
                  <Link to={`/products/${p.id}`}>{p.productName}</Link>
                </li>
              )}
          </ul>
        </div>
      </div>
    )
  }
}

CategoryTemplate.propTypes = propTypes

export default CategoryTemplate

export const pageQuery = graphql`
  query categoryQuery($id: String!) {
    contentfulCategory(id: { eq: $id }) {
      title
      icon {
        file {
          url
        }
      }
      product {
        id
        productName
      }
    }
  }
`
