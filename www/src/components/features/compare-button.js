import React from "react"
import hex2rgba from "hex2rgba"

import { fontSizes, colors, radii, space, sizes } from "../../utils/presets"

import wordpress from "../../assets/wordpress.png"
import drupal from "../../assets/drupal.png"
import jekyll from "../../assets/jekyll.svg"
import squarespace from "../../assets/squarespace-compressed.png"
import nextjs from "../../assets/nextjs.svg"
import hugo from "../../assets/hugo.png"
import nuxtjs from "../../assets/nuxtjs.png"

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
    borderColor: colors.gatsby,
    cursor: `pointer`,
  },
  ":focus": {
    outline: 0,
    boxShadow: `0 0 0 ${space[1]} ${hex2rgba(colors.lilac, 0.25)}`,
  },
}

const logoDictionary = {
  wordpress,
  drupal,
  jekyll,
  squarespace,
  nextjs,
  hugo,
  nuxtjs,
}

const CompareButton = ({ children, optionKey, selected, setSelected }) => (
  <button
    css={{
      ...compareButtonStyles,
      color: selected ? colors.white : colors.purple[200],
      backgroundColor: selected ? colors.lavender : colors.white,
      borderColor: selected ? colors.gatsby : colors.ui.border.form,
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
