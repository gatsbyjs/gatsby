/** @jsx jsx */
import { jsx } from "theme-ui"

const Avatar = ({ ...rest }) => (
  <div
    sx={{
      bg: `grey.10`,
      borderRadius: 6,
      flex: `0 0 auto`,
      height: `avatar`,
      lineHeight: `solid`,
      width: `avatar`,
    }}
    {…rest}
  ></div>
)

export default Avatar
