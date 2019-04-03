import React from "react"
import { Box, Color } from "ink"

const ColorSwitcher = ({ hideColors, children, ...props }) => {
  if (hideColors) {
    return children
  }

  return <Color {...props}>{children}</Color>
}

const createLabel = (text, color) => (...props) => (
  <ColorSwitcher {...{ [color]: true, ...props }}>{text}</ColorSwitcher>
)

const getLabel = type => {
  switch (type) {
    case `success`:
      return createLabel(`success`, `green`)
    case `verbose`:
      return createLabel(`verbose`, `gray`)
    case `warn`:
      return createLabel(`warn`, `yellow`)
    case `info`:
      return createLabel(`info`, `blue`)
  }
}

export const Message = ({ type, hideColors, children }) => {
  if (!type) {
    return children
  }

  const TextLabel = getLabel(type)

  return (
    <>
      <TextLabel hideColors={hideColors} />
      {` `}
      {children}
    </>
  )
}
