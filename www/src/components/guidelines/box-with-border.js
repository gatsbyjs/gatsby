import styled from "@emotion/styled"
import themeGet from "@styled-system/theme-get"

import { Box } from "./system"

const BoxWithBorder = styled(Box)(
  props =>
    props.withBorder && {
      ":after": {
        border: `1px solid ${themeGet(`colors.blackFade.10`)(props)}`,
        borderRadius: `${themeGet(`radii.1`)(props)}`,
        bottom: 0,
        content: `" "`,
        left: 0,
        position: `absolute`,
        right: 0,
        top: 0,
      },
    }
)

BoxWithBorder.defaultProps = {
  borderRadius: 1,
  position: `relative`,
}

export default BoxWithBorder
