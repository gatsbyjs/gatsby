import styled from "@emotion/styled"
import { themeGet } from "styled-system"

import { Box } from "./system"

const BoxWithBorder = styled(Box)(
  props =>
    props.withBorder && {
      ":after": {
        content: `" "`,
        position: `absolute`,
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        borderRadius: `${themeGet(`radii.1`)(props)}px`,
        border: `1px solid ${themeGet(`colors.blackFade.10`)(props)}`,
      },
    }
)

BoxWithBorder.defaultProps = {
  borderRadius: 1,
  position: `relative`,
}

export default BoxWithBorder
