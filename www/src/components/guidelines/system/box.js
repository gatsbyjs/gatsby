import styled from "@emotion/styled"
import isPropValid from "@emotion/is-prop-valid"

import {
  space,
  color,
  width,
  maxWidth,
  height,
  flex,
  order,
  alignSelf,
  flexWrap,
  fontSize,
  textAlign,
  borderRadius,
  display,
  position,
  boxShadow,
} from "styled-system"

const shouldForwardProp = propTypes => prop =>
  isPropValid(prop) && !Object.keys(propTypes).includes(prop)

const boxPropTypes = {
  ...alignSelf.propTypes,
  ...borderRadius.propTypes,
  ...color.propTypes,
  ...display.propTypes,
  ...flex.propTypes,
  ...fontSize.propTypes,
  ...height.propTypes,
  ...order.propTypes,
  ...position.propTypes,
  ...space.propTypes,
  ...width.propTypes,
  ...maxWidth.propTypes,
  ...textAlign.propTypes,
  ...boxShadow.propTypes,
  ...flexWrap.propTypes,
}

const Box = styled(`div`, {
  shouldForwardProp: shouldForwardProp(boxPropTypes),
})(
  {
    boxSizing: `border-box`,
  },
  alignSelf,
  borderRadius,
  color,
  display,
  flex,
  height,
  fontSize,
  maxWidth,
  order,
  position,
  space,
  textAlign,
  width,
  boxShadow,
  flexWrap
)

Box.propTypes = boxPropTypes

export default Box
