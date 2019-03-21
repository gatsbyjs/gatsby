import colors from "./colors"
import typography from "./typography"
import theme from "../theme"

const mergedTheme = {
  colors: { ...colors, ...(theme.colors || {}) },
  ...{ ...typography, ...(theme.typography || {}) },
}

export default mergedTheme
