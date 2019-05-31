import styled from "@emotion/styled"
import {
  borders,
  borderColor,
  borderRadius,
  buttonStyle,
  fontFamily,
  fontSize,
  fontWeight,
  themeGet,
} from "styled-system"

import Box from "./box"

const buttonPropTypes = {
  ...borders.propTypes,
  ...borderColor.propTypes,
  ...borderRadius.propTypes,
  ...buttonStyle.propTypes,
  ...fontFamily.propTypes,
  ...fontWeight.propTypes,
}

const Button = styled(Box)(
  props => {
    return {
      "&&": {
        borderColor: themeGet(`colors.gatsby`)(props),
        color: themeGet(`colors.white`)(props),
      },
    }
  },
  {
    appearance: `none`,
    display: `inline-block`,
    lineHeight: `inherit`,
    textAlign: `center`,
    textDecoration: `none`,
    WebkitFontSmoothing: `antialiased`,
  },
  borders,
  borderColor,
  borderRadius,
  buttonStyle,
  fontFamily,
  fontSize,
  fontWeight,
  props =>
    props.outlined && {
      background: themeGet(`colors.white`)(props),
      fontWeight: themeGet(`fontWeights.0`)(props),
      padding: `${themeGet(`space.2`)(props)}px ${themeGet(`space.3`)(
        props
      )}px`,
      "&&": {
        border: `1px solid ${themeGet(`colors.purple.30`)(props)}`,
        color: themeGet(`colors.purple.60`)(props),
        fontSize: `${themeGet(`fontSizes.3`)(props)}`,
        ":hover": {
          borderColor: themeGet(`colors.lilac`)(props),
        },
      },
      svg: {
        height: 20,
      },
      [`@media (min-width: ${themeGet(`breakpoints.md`)(props)}px)`]: {
        fontSize: `${themeGet(`fontSizes.3`)(props)}`,
      },
    }
)

Button.propTypes = buttonPropTypes

Button.defaultProps = {
  as: `button`,
  bg: `purple.60`,
  border: 0,
  borderRadius: 2,
  color: `white`,
  fontFamily: `header`,
  fontSize: { xxs: 4, md: 5 },
  fontWeight: 1,
  m: 0,
  px: 4,
  py: 2,
}

export default Button
