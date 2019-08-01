import styled from "@emotion/styled"

import { Box } from "./system"

const Avatar = styled(Box)()

Avatar.defaultProps = {
  bg: `grey.10`,
  borderRadius: 6,
  flex: `0 0 auto`,
  height: `avatar`,
  lineHeight: `solid`,
  width: `avatar`,
}

export default Avatar
