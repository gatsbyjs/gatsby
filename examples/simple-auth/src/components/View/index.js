import React from "react"
import PropTypes from "prop-types"
import styles from "./view.module.css"

const View = ({ title, children }) => (
  <section className={styles.view}>
    <h1 className={styles[`view__heading`]}>{title}</h1>
    {children}
  </section>
)

View.propTypes = {
  title: PropTypes.string.isRequired,
}

export default View
