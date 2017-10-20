import React from "react"
import PropTypes from "prop-types"

const SectionTitle = props => (
  <tr css={{ borderBottom: 0 }}>
    <td css={{ borderBottom: 0 }} colSpan={4}>
      <h3>{props.text}</h3>
    </td>
  </tr>
)

SectionTitle.propTypes = {
  text: PropTypes.string,
}

export default SectionTitle
