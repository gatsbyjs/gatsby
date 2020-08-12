import React from "react"

import { Container } from "./containers"
import NavItem from "./nav-item"

const Header = () => (
  <Container py={4}>
    <nav>
      <NavItem to="/guidelines/color/">Color</NavItem>
      <NavItem to="/guidelines/logo/">Logo</NavItem>
      <NavItem to="/guidelines/typography/">Typography</NavItem>
      <NavItem to="/guidelines/design-tokens/">Design Tokens</NavItem>
    </nav>
  </Container>
)

export default Header
