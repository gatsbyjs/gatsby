/** @jsx jsx */
import { jsx } from "theme-ui"
import PropTypes from "prop-types"

export default function SectionTitle({ text }) {
  return (
    <tr sx={{ borderBottom: 0 }}>
      <td sx={{ borderBottom: 0 }} colSpan={4}>
        <h3 sx={{ mt: 6 }}>{text}</h3>
      </td>
    </tr>
  )
}

SectionTitle.propTypes = {
  text: PropTypes.string,
}
