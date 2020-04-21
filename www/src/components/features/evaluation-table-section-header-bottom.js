/** @jsx jsx */
import { jsx } from "theme-ui"
import styled from "@emotion/styled"

import logo from "../../assets/monogram.svg"
import logoDictionary from "./logo-dictionary"

const Td = styled.td`
  background: ${t => t.theme.colors.background};
  border-color: ${t => t.theme.colors.ui.light};
  display: table-cell;
  font-family: ${t => t.theme.fonts.heading};
  font-weight: 600;
  line-height: ${t => t.theme.lineHeights.dense};
  padding: ${t => t.theme.space[3]};
  text-align: left;
  vertical-align: middle;
`

const subHeaderTitleStyles = {
  display: `block`,
  height: t => [t.space[6], t.space[7]],
  margin: `auto`,
  marginBottom: 0,
}

const renderSubHeader = props => (
  <tr
    key="subhead"
    style={{
      display: !props.display ? `none` : `table-row`,
    }}
  >
    <Td>{props.category}</Td>
    <Td>
      <img src={logo} sx={subHeaderTitleStyles} alt="Gatsby logo" />
    </Td>
    {props.options.map((option, i) => (
      <Td key={i}>
        <img
          src={logoDictionary[option.key]}
          sx={subHeaderTitleStyles}
          alt={`${option.display} Logo`}
        />
      </Td>
    ))}
  </tr>
)

export default renderSubHeader
