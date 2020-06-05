/** @jsx jsx */
import { jsx } from "theme-ui"

const Badge = ({ children, ...rest }) => (
  <div
    sx={{
      display: `inline-flex`,
      alignItems: `center`,
      position: `relative`,
      fontFamily: `body`,
      fontSize: 0,
      fontWeight: `body`,
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
      ...rest,
    }}
  >
    {children}
  </div>
)

export default Badge
