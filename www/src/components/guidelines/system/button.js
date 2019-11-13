import styled from "@emotion/styled"
import { border, typography, compose } from "styled-system"
import themeGet from "@styled-system/theme-get"
import propTypes from "@styled-system/prop-types"

import Box from "./box"

const buttonPropTypes = { ...propTypes.border, ...propTypes.typography }

const styleProps = compose(border, typography)

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
  },
  styleProps,
  props =>
    props.outlined && {
      background: themeGet(`colors.white`)(props),
      fontWeight: themeGet(`fontWeights.body`)(props),
      padding: `${themeGet(`space.2`)(props)} ${themeGet(`space.3`)(props)}`,
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
  fontWeight: `bold`,
  px: 4,
  py: 2,
}

export default Button
