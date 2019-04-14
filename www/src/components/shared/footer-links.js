import React from "react"
import { Link } from "gatsby"
import styled from "@emotion/styled"
import { colors, space } from "../../utils/presets"

const FooterList = styled.ul`
  border-top: 1px solid ${colors.ui.light};
  padding-top: ${space[9]};
  margin: ${space[9]} 0;
  list-style: none;
  text-align: center;
  width: 100%;

  li {
    color: ${colors.gray.calm};
    display: inline-block;

    &:first-of-type {
      border-right: 1px solid;
      border-color: ${colors.gray.bright};
      margin-right: 1em;
      padding-right: 1em;
    }
  }
`

const FooterLinks = () => (
  <FooterList>
    <li>
      <Link to="/accessibility-statement">Accessibility Statement</Link>
    </li>
    <li>
      <a href="https://www.gatsbyjs.com">Gatsbyjs.com</a>
    </li>
  </FooterList>
)

export default FooterLinks
