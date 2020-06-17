/** @jsx jsx */
import { jsx } from "theme-ui"

const Badge = ({ children }) => (
  <div
    sx={{
      display: `inline-flex`,
      alignItems: `center`,
      position: `relative`,
      fontSize: 0,
      letterSpacing: `tracked`,
      textTransform: `uppercase`,
      lineHeight: `solid`,
      color: `yellow.90`,
      bg: `yellow.10`,
      border: 1,
      borderColor: `yellow.10`,
      borderRadius: 5,
      py: 1,
      px: 2,
      my: 3,
    }}
  >
    {children}
  </div>
)

export default Badge
