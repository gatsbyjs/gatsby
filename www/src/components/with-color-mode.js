import { useColorMode } from "theme-ui"

const withColorMode = Component => props => {
  const colorMode = useColorMode()

  return <Component colorMode={colorMode} {...props} />
}

export default withColorMode
