import styled from "@emotion/styled"
import shouldForwardProp from "@styled-system/should-forward-prop"
import {
  border,
  boxShadow,
  color,
  flexbox,
  layout,
  position,
  space,
  typography,
  compose,
} from "styled-system"
import propTypes from "@styled-system/prop-types"

const boxPropTypes = {
  ...propTypes.border,
  ...propTypes.boxShadow,
  ...propTypes.color,
  ...propTypes.flexbox,
  ...propTypes.layout,
  ...propTypes.position,
  ...propTypes.space,
  ...propTypes.typography,
}

const styleProps = compose(
  border,
  boxShadow,
  color,
  flexbox,
  layout,
  position,
  space,
  typography
)

const Box = styled(`div`, { shouldForwardProp })(
  { boxSizing: `border-box` },
  styleProps
)

Box.propTypes = boxPropTypes

export default Box
