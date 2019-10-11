import { useColorMode } from "theme-ui"
import React from "react"

const withColorMode = Component => props => {
  const colorMode = useColorMode()

  return <Component colorMode={colorMode} {...props} />
}

export default withColorMode
