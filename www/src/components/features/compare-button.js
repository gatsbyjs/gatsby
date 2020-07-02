/** @jsx jsx */
import { jsx } from "theme-ui"

import logoDictionary from "./logo-dictionary"

const compareButtonStyles = {
  display: `flex`,
  flexDirection: `column`,
  fontFamily: `heading`,
  alignItems: `center`,
  justifyContent: `center`,
  border: 1,
  borderRadius: 1,
  p: 2,
  ":hover": {
    borderColor: `purple.60`,
    cursor: `pointer`,
  },
  ":focus": {
    outline: 0,
    boxShadow: t =>
      `0 0 0 ${t.space[1]} ${t.colors.themedInput.focusBoxShadow}`,
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
    onClick={() => setSelected({ [optionKey]: !selected })}
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
