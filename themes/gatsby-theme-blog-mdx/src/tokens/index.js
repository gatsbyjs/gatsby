import colors from "./colors"
import styles from "./styles"
import theme from "../theme"

const mergedTheme = {
  colors: { ...colors, ...(theme.colors || {}) },
  styles,
}

export default mergedTheme
