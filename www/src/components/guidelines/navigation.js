import React from "react"
import { Link } from "gatsby"
import styled from "@emotion/styled"
import { color, fontFamily, fontWeight, fontSize, space } from "styled-system"
import shouldForwardProp from "@styled-system/should-forward-prop"

import { colors } from "../../utils/presets"

const NavLink = styled(Link, { shouldForwardProp })(
  color,
  fontFamily,
  fontSize,
  fontWeight,
  space
)

NavLink.defaultProps = {
  color: `grey.80`,
  fontFamily: `header`,
  fontSize: 3,
  fontWeight: 400,
  mr: 3,
}

NavLink.propTypes = {
  ...color.propTypes,
  ...fontWeight.propTypes,
  ...fontFamily.propTypes,
  ...fontSize.propTypes,
  ...space.propTypes,
}

export const NavItem = props => (
  <NavLink
    getProps={({ isCurrent }) =>
      isCurrent ? { style: { color: colors.lilac } } : false
    }
    {...props}
  />
)
