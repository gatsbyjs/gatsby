import { useColorMode } from "theme-ui"
import React from "react"

const withColorMode = Component => props => {
  const [colorMode, setColorMode] = useColorMode()
  const prefersDark = window.matchMedia(`(prefers-color-scheme: dark)`).matches

  setColorMode(prefersDark ? `dark` : `light`)

  return <Component colorMode={colorMode} {...props} />
}

export default withColorMode
