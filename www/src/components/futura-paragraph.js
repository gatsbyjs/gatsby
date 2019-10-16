/** @jsx jsx */
import { jsx } from "theme-ui"

const FuturaParagraph = ({ children }) => (
  <p
    sx={{
      fontFamily: `header`,
      fontSize: 3,
      mb: 0,
    }}
  >
    {children}
  </p>
)

export default FuturaParagraph
