/** @jsx jsx */
import { jsx } from "theme-ui"

const CardHeadline = ({ children }) => (
  <h2
    sx={{
      fontSize: 4,
      lineHeight: `dense`,
      mt: 0,
    }}
  >
    {children}
  </h2>
)

export default CardHeadline
