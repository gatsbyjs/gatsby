import styled from "@emotion/styled"
import {
  fontFamily,
  fontWeight,
  textAlign,
  lineHeight,
  letterSpacing,
  fontStyle,
} from "styled-system"
import shouldForwardProp from "@styled-system/should-forward-prop"

import Box from "./box"

const textPropTypes = {
  ...fontFamily.propTypes,
  ...fontStyle.propTypes,
  ...fontWeight.propTypes,
  ...letterSpacing.propTypes,
  ...lineHeight.propTypes,
  ...textAlign.propTypes,
}

const Text = styled(Box, { shouldForwardProp })(
  fontFamily,
  fontStyle,
  fontWeight,
  letterSpacing,
  lineHeight,
  textAlign
)

Text.propTypes = textPropTypes

Text.defaultProps = {
  color: `grey.70`,
}

export default Text
