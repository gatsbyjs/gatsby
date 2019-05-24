import React from "react"
import { Link } from "gatsby"
import styled from "@emotion/styled"
import { colors, space, fontSizes } from "../../utils/presets"

const FooterList = styled.ul`
  border-top: 1px solid ${colors.ui.border.subtle};
  font-size: ${fontSizes[1]};
  padding-top: ${space[9]};
  margin: ${space[9]} 0
    ${props => (props.bottomMargin ? props.bottomMargin : `0`)};
  list-style: none;
  text-align: center;
  width: 100%;

  li {
    display: inline-block;

    &:first-of-type:after {
      color: ${colors.grey[300]};
      content: "•";
      padding-left: 1em;
      margin-right: 1em;
    }
    a {
      color: ${colors.text.secondary};
      border-color: ${colors.grey[300]};
    }
  }
`

const FooterLinks = props => (
  <FooterList bottomMargin={props.bottomMargin}>
    <li>
      <Link to="/accessibility-statement">Accessibility Statement</Link>
    </li>
    <li>
      <a href="https://www.gatsbyjs.com">Gatsbyjs.com</a>
    </li>
  </FooterList>
)

export default FooterLinks
