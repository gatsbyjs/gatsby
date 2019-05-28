import styled from "@emotion/styled"
import shouldForwardProp from "@styled-system/should-forward-prop"
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
  shouldForwardProp,
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
