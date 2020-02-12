import React from "react"
import { Link } from "gatsby"
import styled from "@emotion/styled"
import { color, space, typography } from "styled-system"
import shouldForwardProp from "@styled-system/should-forward-prop"
import propTypes from "@styled-system/prop-types"
import themeGet from "@styled-system/theme-get"

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
  typography,
  space
)

NavLink.defaultProps = {
  color: `navigation.linkDefault`,
  fontFamily: `heading`,
  fontSize: 3,
  fontWeight: `body`,
  mr: 4,
}

NavLink.propTypes = {
  ...propTypes.color,
  ...propTypes.space,
  ...propTypes.typography,
}

const NavItem = props => <NavLink {...props} />

export default NavItem
