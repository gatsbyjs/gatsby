import styled from "@emotion/styled"

import { Box } from "./system"
import theme from "../../utils/guidelines/theme"

const Avatar = styled(Box)()

Avatar.defaultProps = {
  bg: `grey.10`,
  borderRadius: 6,
  flex: `0 0 auto`,
  // @todo figure out how to access `space` from theme here
  // (in a more elegant way) … also wondering if styled-system
  // is going to pick up `sizes` as defined in https://system-ui.com/theme
  height: theme.space[7],
  lineHeight: `solid`,
  width: theme.space[7],
}

export default Avatar
