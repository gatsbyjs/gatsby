import React from "react"
import * as PropTypes from "prop-types"

import { Link, graphql } from "gatsby"
import { GatsbyImage } from "gatsby-plugin-image"

import Layout from "../layouts"
import { rhythm } from "../utils/typography"

const propTypes = {
  data: PropTypes.object.isRequired,
}

class CategoryTemplate extends React.Component {
  render() {
    const category = this.props.data.contentfulCategory
    const {
      title: { title },
      product,
      icon,
    } = category
    const iconImg = icon.gatsbyImageData
    return (
      <Layout>
        <div
          style={{
            display: `flex`,
            alignItems: `center`,
            marginBottom: rhythm(1),
          }}
        >
          {iconImg && (
            <GatsbyImage
              style={{
                marginRight: rhythm(1 / 2),
              }}
              image={iconImg}
            />
          )}
          <h1 style={{ marginBottom: 0 }}>Category: {title}</h1>
        </div>
        <div>
          <h2>Products</h2>
          <ul>
            {product &&
              product.map((p, i) => (
                <li key={i}>
                  <Link to={`/products/${p.id}`}>
                    {p.productName.productName}
                  </Link>
                </li>
              ))}
          </ul>
        </div>
      </Layout>
    )
  }
}

CategoryTemplate.propTypes = propTypes

export default CategoryTemplate

export const pageQuery = graphql`
  query($id: String!) {
    contentfulCategory(id: { eq: $id }) {
      title {
        title
      }
      icon {
        gatsbyImageData(layout: FIXED, width: 75)
      }
      product {
        id
        productName {
          productName
        }
      }
    }
  }
`
