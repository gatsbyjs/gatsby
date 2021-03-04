import React from "react"
import { Link, graphql } from "gatsby"
import { MdChevronRight } from "react-icons/md"

import ImagePicker from "./image-picker"

import * as styles from "./product.module.css"

function Product({ description, fields, showDetail, title, images }) {
  return (
    <div className={styles.product}>
      <ImagePicker
        className={styles.imageContainer}
        images={images.map(image => image.localFile)}
      />
      <h2 className={styles.title}>{title}</h2>
      <p>
        {showDetail === false ? `${description.slice(0, 100)}...` : description}
      </p>
      {showDetail === false && (
        <Link className={styles.detail} to={fields.slug}>
          See more detail <MdChevronRight size={24} />
        </Link>
      )}
    </div>
  )
}

Product.defaultProps = {
  showDetail: false,
}

export const productFragment = graphql`
  fragment ProductDetails on ShopifyProduct {
    id
    description
    fields {
      slug
    }
    title
    images {
      localFile {
        full: childImageSharp {
          fluid(maxWidth: 500, cropFocus: NORTH) {
            ...GatsbyImageSharpFluid
          }
        }
      }
    }
  }
`

export default Product
