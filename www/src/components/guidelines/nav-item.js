import React from "react"
import { Link } from "gatsby"
import styled from "@emotion/styled"
import {
  color,
  fontFamily,
  fontWeight,
  fontSize,
  space,
  themeGet,
} from "styled-system"
import shouldForwardProp from "@styled-system/should-forward-prop"

const ActiveLink = props => <Link {...props} activeClassName="active" />

const NavLink = styled(ActiveLink, { shouldForwardProp })(
  props => {
    return {
      "&.active": {
        color: themeGet(`colors.lilac`)(props),
      },
    }
  },
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

const NavItem = props => <NavLink {...props} />

export default NavItem
