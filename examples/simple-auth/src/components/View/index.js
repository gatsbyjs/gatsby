import React from "react"
import PropTypes from "prop-types"
import { view } from "./view.module.css"

const View = ({ title, children }) => (
  <section className={view}>
    <h1>{title}</h1>
    {children}
  </section>
)

View.propTypes = {
  title: PropTypes.string.isRequired,
}

export default View
