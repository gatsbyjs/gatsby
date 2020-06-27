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

export default function headerTop({ columnHeaders }) {
  return (
    <tr>
      {columnHeaders.map((header, i) => (
        <td
          key={i}
          sx={{
            width: [i === 0 ? 120 : `inherit`, 125, 150, 175],
            ...tdStyles,
          }}
        >
          <span>{header}</span>
        </td>
      ))}
    </tr>
  )
}
