/** @jsx jsx */
import { jsx } from "theme-ui"

const tdStyles = {
  "&&": { p: 3 },
  display: [`none`, `table-cell`],
  fontSize: 0,
  fontWeight: `body`,
  lineHeight: `solid`,
  textTransform: `uppercase`,
  textAlign: `center`,
  verticalAlign: `bottom`,
  border: 0,
  color: `textMuted`,
  bg: `ui.background`,
  "&:last-child": {
    borderTopRightRadius: 2,
  },
  width: [`inherit`, 125, 150, 175],
  "&:first-of-type": {
    width: [120, 125, 150, 175],
  },
  span: {
    WebkitHyphens: `auto`,
    MsHyphens: `auto`,
    hyphens: `auto`,
    display: `inline-block`,
    "&:first-of-type": {
      borderTopLeftRadius: 2,
      textAlign: `left`,
    },
  },
}

export default function HeaderTop({ columnHeaders }) {
  return (
    <tr>
      {columnHeaders.map((header, i) => (
        <td
          key={i}
          sx={{
            ...tdStyles,
          }}
        >
          <span>{header}</span>
        </td>
      ))}
    </tr>
  )
}
