import React from "react"
import hex2rgba from "hex2rgba"

import { colors, radii, space } from "../../utils/presets"
import logoDictionary from "./logo-dictionary"

const compareButtonStyles = {
  display: `flex`,
  flexDirection: `column`,
  fontFamily: `Futura`,
  alignItems: `center`,
  justifyContent: `center`,
  borderRadius: radii[1],
  borderWidth: 1,
  borderStyle: `solid`,
  padding: space[2],
  ":hover": {
    borderColor: colors.purple[60],
    cursor: `pointer`,
  },
  ":focus": {
    outline: 0,
    boxShadow: `0 0 0 ${space[1]} ${hex2rgba(colors.grey[20], 0.25)}`,
  },
}

const CompareButton = ({ children, optionKey, selected, setSelected }) => (
  <button
    css={{
      ...compareButtonStyles,
      color: selected ? colors.white : colors.grey[40],
      backgroundColor: selected ? colors.purple[40] : colors.white,
      borderColor: selected ? colors.purple[60] : colors.ui.border.form,
    }}
    onClick={e => setSelected({ [optionKey]: !selected })}
  >
    <img
      css={{
        height: space[6],
        marginBottom: 0,
      }}
      src={logoDictionary[optionKey]}
    />
    {children}
  </button>
)

export default CompareButton
