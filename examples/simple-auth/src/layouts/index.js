import React from "react"
import PropTypes from "prop-types"
import Helmet from "react-helmet"

import Header from "../components/Header"

// Global styles and component-specific styles.
import "./global.css"
import styles from "./main.module.css"

const TemplateWrapper = ({ children }) => (
  <div>
    <Helmet title="Simple Authentication With Gatsby" />
    <Header />
    <main className={styles.main}>{children()}</main>
  </div>
)

TemplateWrapper.propTypes = {
  children: PropTypes.func,
}

export default TemplateWrapper
