import styled from "@emotion/styled"
import isPropValid from "@emotion/is-prop-valid"
import {
  fontFamily,
  fontWeight,
  textAlign,
  lineHeight,
  letterSpacing,
  fontStyle,
} from "styled-system"

import Box from "./box"

const shouldForwardProp = propTypes => prop =>
  isPropValid(prop) && !Object.keys(propTypes).includes(prop)

const textPropTypes = {
  ...fontFamily.propTypes,
  ...fontStyle.propTypes,
  ...fontWeight.propTypes,
  ...letterSpacing.propTypes,
  ...lineHeight.propTypes,
  ...textAlign.propTypes,
}

const Text = styled(Box, {
  shouldForwardProp: shouldForwardProp(textPropTypes),
})(fontFamily, fontStyle, fontWeight, letterSpacing, lineHeight, textAlign)

Text.propTypes = textPropTypes

Text.defaultProps = {
  color: `grey.700`,
}

export default Text
