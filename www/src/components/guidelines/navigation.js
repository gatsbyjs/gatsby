import React from "react"
import { Link } from "gatsby"
import {
  color,
  fontFamily,
  fontWeight,
  fontSize,
  space,
  themeGet,
} from "styled-system"
import styled from "@emotion/styled"
import { colors } from "../../utils/presets"

export const TitleLink = styled(Link)(
  {
    textDecoration: `none`,
  },
  props => {
    return {
      color: themeGet(`colors.black`)(props),
      fontSize: themeGet(`fontSizes.4`)(props),
      fontWeight: themeGet(`fontWeights.1`)(props),
    }
  }
)

const NavLink = styled(TitleLink)(
  color,
  fontWeight,
  fontFamily,
  fontSize,
  space,
  props => {
    return {
      color: props.color,
    }
  }
)

NavLink.propTypes = {
  ...color.propTypes,
  ...fontWeight.propTypes,
  ...fontFamily.propTypes,
  ...fontSize.propTypes,
  ...space.propTypes,
}

NavLink.defaultProps = {
  color: `grey.80`,
  fontFamily: `header`,
  fontSize: 3,
  fontWeight: 400,
  mr: 3,
}

export const NavItem = props => (
  <NavLink
    getProps={({ isCurrent }) =>
      isCurrent ? { style: { color: colors.lilac } } : false
    }
    {...props}
  />
)
