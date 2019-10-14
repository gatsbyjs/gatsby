/** @jsx jsx */
import { jsx } from "theme-ui"
import hex2rgba from "hex2rgba"
import { colors } from "gatsby-design-tokens"

import logoDictionary from "./logo-dictionary"

const compareButtonStyles = {
  display: `flex`,
  flexDirection: `column`,
  fontFamily: `header`,
  alignItems: `center`,
  justifyContent: `center`,
  borderRadius: 1,
  borderWidth: 1,
  borderStyle: `solid`,
  p: 2,
  ":hover": {
    borderColor: `purple.60`,
    cursor: `pointer`,
  },
  ":focus": {
    outline: 0,
    boxShadow: t => `0 0 0 ${t.space[1]} ${hex2rgba(colors.grey[20], 0.25)}`,
  },
}

const CompareButton = ({ children, optionKey, selected, setSelected }) => (
  <button
    sx={{
      ...compareButtonStyles,
      backgroundColor: selected ? `purple.50` : `background`,
      borderColor: selected ? `purple.60` : `ui.border`,
      color: selected ? `white` : `textMuted`,
    }}
    onClick={e => setSelected({ [optionKey]: !selected })}
  >
    <img
      sx={{
        height: t => t.space[6],
        mb: 0,
      }}
      src={logoDictionary[optionKey]}
    />
    {children}
  </button>
)

export default CompareButton
