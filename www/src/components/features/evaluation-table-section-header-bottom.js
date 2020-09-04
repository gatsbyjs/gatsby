/** @jsx jsx */
import { jsx } from "theme-ui"

import logo from "../../assets/monogram.svg"
import logoDictionary from "./logo-dictionary"

const tdStyles = {
  backgroundColor: `background`,
  borderColor: `ui.light`,
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

const Td = ({ children }) => <td sx={tdStyles}>{children}</td>

export default function HeaderBottom({ display, category, options }) {
  return (
    <tr
      sx={{
        display: !display ? `none` : `table-row`,
      }}
    >
      <Td>{category}</Td>
      <Td>{<img src={logo} sx={subHeaderTitleStyles} alt="Gatsby logo" />}</Td>
      {options.map((option, i) => (
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
}
