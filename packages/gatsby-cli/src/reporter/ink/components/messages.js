import React from "react"
import { Box, Color } from "ink"

const ColorSwitcher = ({ hideColors, children, ...props }) => {
  if (hideColors) {
    return children
  }

  return <Color {...props}>{children}</Color>
}

export const Success = ({ hideColors, children }) => (
  <Box>
    <ColorSwitcher hideColors={hideColors} green>
      success
    </ColorSwitcher>
    {` `}
    {children}
  </Box>
)
export const Verbose = ({ hideColors, children }) => (
  <Box>
    <ColorSwitcher hideColors={hideColors} gray>
      verbose
    </ColorSwitcher>
    {` `}
    {children}
  </Box>
)
export const Info = ({ hideColors, children }) => (
  <Box>
    <ColorSwitcher hideColors={hideColors} blue>
      info
    </ColorSwitcher>
    {` `}
    {children}
  </Box>
)
export const Warn = ({ hideColors, children }) => (
  <Box>
    <ColorSwitcher hideColors={hideColors} yellow>
      info
    </ColorSwitcher>
    {` `}
    {children}
  </Box>
)
