import styled from "@emotion/styled"
import shouldForwardProp from "@styled-system/should-forward-prop"
import {
  alignSelf,
  border,
  borderRadius,
  boxShadow,
  color,
  display,
  flex,
  flexWrap,
  fontSize,
  height,
  maxWidth,
  order,
  position,
  space,
  textAlign,
  width,
} from "styled-system"

const boxPropTypes = {
  ...alignSelf.propTypes,
  ...border.propTypes,
  ...borderRadius.propTypes,
  ...boxShadow.propTypes,
  ...color.propTypes,
  ...display.propTypes,
  ...flex.propTypes,
  ...fontSize.propTypes,
  ...flexWrap.propTypes,
  ...height.propTypes,
  ...maxWidth.propTypes,
  ...order.propTypes,
  ...position.propTypes,
  ...space.propTypes,
  ...textAlign.propTypes,
  ...width.propTypes,
}

const Box = styled(`div`, {
  shouldForwardProp,
})(
  {
    boxSizing: `border-box`,
  },
  alignSelf,
  borderRadius,
  boxShadow,
  color,
  display,
  flex,
  flexWrap,
  height,
  fontSize,
  maxWidth,
  order,
  position,
  space,
  textAlign,
  width
)

Box.propTypes = boxPropTypes

export default Box
