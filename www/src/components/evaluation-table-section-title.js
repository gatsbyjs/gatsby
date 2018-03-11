import React from "react"
import PropTypes from "prop-types"

import { rhythm, options } from "../utils/typography"

const SectionTitle = props => (
  <tr css={{ borderBottom: 0 }}>
    <td css={{ borderBottom: 0 }} colSpan={4}>
      <h3
        css={{
          marginTop: rhythm(options.blockMarginBottom),
        }}
      >
        {props.text}
      </h3>
    </td>
  </tr>
)

SectionTitle.propTypes = {
  text: PropTypes.string,
}

export default SectionTitle
