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
      productName: { productName },
      productDescription,
      price,
      image,
      brand,
      categories,
    } = product
    return (
      <div>
        <div
          style={{
            display: `flex`,
            alignItems: `center`,
          }}
        >
          <img
            style={{
              height: image[0].responsiveResolution.height,
              width: image[0].responsiveResolution.width,
            }}
            src={image[0].responsiveResolution.src}
            srcSet={image[0].responsiveResolution.srcSet}
          />
          <h4>{productName}</h4>
        </div>
        <h1>{productName}</h1>
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
      </div>
    )
  }
}

ProductTemplate.propTypes = propTypes

export default ProductTemplate

export const pageQuery = graphql`
  query productQuery($id: String!) {
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
        responsiveResolution(width: 50, height: 50) {
          src
          srcSet
          height
          width
        }
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
