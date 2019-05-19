import React from "react"

import styles from "./product-list.module.css"

function ProductList({ children }) {
  return <div className={styles.container}>{children}</div>
}

export default ProductList
