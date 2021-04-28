import React from "react"
import * as PropTypes from "prop-types"

import { Link, graphql } from "gatsby"
import { GatsbyImage } from "gatsby-plugin-image"

import Layout from "../layouts"
import { rhythm } from "../utils/typography"

const propTypes = {
  data: PropTypes.object.isRequired,
}

class ProductTemplate extends React.Component {
  render() {
    const product = this.props.data.contentfulProduct
    const {
      productName: { productName },
      productDescription,
      price,
      image,
      brand,
      categories,
    } = product
    const productImg = image[0]?.gatsbyImageData
    return (
      <Layout>
        <div
          style={{
            display: `flex`,
            justifyContent: `center`,
          }}
        >
          {productImg && (
            <GatsbyImage
              style={{ marginBottom: rhythm(1) }}
              image={productImg}
            />
          )}
        </div>
        <h1 style={{ marginBottom: rhythm(1 / 2) }}>{productName}</h1>
        <h4>Made by {brand.companyName.companyName}</h4>
        <div>
          <span>Price: ${price}</span>
          <div
            dangerouslySetInnerHTML={{
              __html: productDescription.childMarkdownRemark.html,
            }}
          />
          <div>
            <span>See other: </span>
            <ul>
              {categories.map((category, i) => (
                <li key={i}>
                  <Link key={i} to={`/categories/${category.id}`}>
                    {category.title.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Layout>
    )
  }
}

ProductTemplate.propTypes = propTypes

export default ProductTemplate

export const pageQuery = graphql`
  query($id: String!) {
    contentfulProduct(id: { eq: $id }) {
      productName {
        productName
      }
      productDescription {
        childMarkdownRemark {
          html
        }
      }
      price
      image {
        gatsbyImageData(width: 200)
      }
      brand {
        companyName {
          companyName
        }
      }
      categories {
        id
        title {
          title
        }
      }
    }
  }
`
