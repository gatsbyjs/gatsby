/** @jsx jsx */
import { jsx } from "theme-ui"
import { Box } from "theme-ui"

const Avatar = ({ children, ...rest }) => (
  <Box
    sx={{
      bg: `grey.10`,
      borderRadius: 6,
      flex: `0 0 auto`,
      height: `avatar`,
      lineHeight: `solid`,
      width: `avatar`,
      ...rest,
    }}
  >
    {children}
  </Box>
)

export default Avatar
