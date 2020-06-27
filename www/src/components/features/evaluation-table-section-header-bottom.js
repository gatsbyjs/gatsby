/** @jsx jsx */
import { jsx } from "theme-ui"

import logo from "../../assets/monogram.svg"
import logoDictionary from "./logo-dictionary"

const tdStyles = {
  display: `table-cell`,
  fontFamily: `heading`,
  lineHeight: `dense`,
  fontWeight: 600,
  textAlign: `left`,
  verticalAlign: `middle`,
  p: 3,
}

const subHeaderTitleStyles = {
  display: `block`,
  height: t => [t.space[6], t.space[7]],
  m: `auto`,
  mb: 0,
}

export default function headerBottom({ display, category, options }) {
  return (
    <tr
      key="subhead"
      sx={{
        display: !display ? `none` : `table-row`,
      }}
    >
      <td sx={tdStyles}>{category}</td>
      <td sx={tdStyles}>
        <img src={logo} sx={subHeaderTitleStyles} alt="Gatsby logo" />
      </td>
      {options.map((option, i) => (
        <td sx={tdStyles} key={i}>
          <img
            src={logoDictionary[option.key]}
            sx={subHeaderTitleStyles}
            alt={`${option.display} Logo`}
          />
        </td>
      ))}
    </tr>
  )
}
