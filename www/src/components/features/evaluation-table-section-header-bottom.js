/** @jsx jsx */
import { jsx } from "theme-ui"
import styled from "@emotion/styled"
import logo from "../../assets/monogram.svg"
import logoDictionary from "./logo-dictionary"
import { space, mediaQueries } from "gatsby-design-tokens"
import { rhythm } from "../../utils/typography"

const Td = styled.td`
  display: table-cell;
  background: ${t => t.theme.colors.background};
  font-weight: 600;
  line-height: ${t => t.theme.lineHeights.dense};
  text-align: left;
  vertical-align: middle;
  font-family: ${t => t.theme.fonts.heading};
  border-color: ${t => t.theme.colors.ui.light};
  padding: ${t => t.theme.space[3]};
`

const subHeaderTitleStyles = {
  height: space[6],
  marginBottom: 0,
  display: `block`,
  margin: `auto`,
  [mediaQueries.xs]: {
    height: rhythm(5 / 4),
  },
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
      <img src={logo} css={subHeaderTitleStyles} alt="Gatsby logo" />
    </Td>
    {props.options.map((option, i) => (
      <Td key={i}>
        <img
          src={logoDictionary[option.key]}
          css={subHeaderTitleStyles}
          alt={`${option.display} Logo`}
        />
      </Td>
    ))}
  </tr>
)

export default renderSubHeader
