import merge from "deepmerge"
import typography from "./typography"
import colors from "./colors"
import styles from "./styles"
import prism from "./prism"

import useBlogThemeConfig from "../hooks/configOptions"

const ThemeUiSettings = () => {
  const blogThemeConfig = useBlogThemeConfig()

  return (
    !blogThemeConfig.disableThemeUiStyling &&
    merge(typography, {
      initialColorMode: `light`,
      colors,
      fonts: {
        heading: `Montserrat, sans-serif`,
        monospace: `Consolas, Menlo, Monaco, source-code-pro, Courier New, monospace`,
      },
      sizes: {
        container: 672,
      },
      styles,
      prism,
    })
  )
}

export default ThemeUiSettings
