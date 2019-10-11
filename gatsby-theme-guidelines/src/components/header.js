import React from "react"

import { Container } from "./containers"
import NavItem from "./nav-item"

const basePath = `/guidelines/`

const Header = () => (
  <Container py={4}>
    <nav>
      <NavItem to={basePath + `color/`}>Color</NavItem>
      <NavItem to={basePath + `logo/`}>Logo</NavItem>
      <NavItem to={basePath + `typography/`}>Typography</NavItem>
      <NavItem to={basePath + `design-tokens/`}>Design Tokens</NavItem>
    </nav>
  </Container>
)

export default Header
