import { useColorMode } from "theme-ui"
import themeUITheme from "../gatsby-plugin-theme-ui"
import { Global, css } from "@emotion/core"

const darkThemeGlobalStyles = css`
  html,
  body {
    background: ${themeUITheme.colors.modes.dark.background};
    color: ${themeUITheme.colors.modes.dark.text.primary};
  }
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    color: ${themeUITheme.colors.modes.dark.text.header};
  }
  blockquote {
    border-color: ${themeUITheme.colors.modes.dark.ui.border.subtle};
  }
  hr {
    background-color: ${themeUITheme.colors.modes.dark.ui.border.subtle};
  }
  .main-body a {
    color: ${themeUITheme.colors.modes.dark.link.color};
    border-bottom: 1px solid ${themeUITheme.colors.modes.dark.link.border};
  }
  .main-body a:hover {
    border-bottom-color: ${themeUITheme.colors.modes.dark.link.linkHoverBorder};
  }
`

const DarkThemeStyles = () => {
  const [colorMode] = useColorMode()

  return colorMode === `dark` ? (
    <Global styles={darkThemeGlobalStyles} />
  ) : (
    false
  )
}

export default DarkThemeStyles
