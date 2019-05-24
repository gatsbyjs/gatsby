import merge from "lodash.merge"
import typography from "./typography"
import colors from "./colors"
import styles from "./styles"
import prism from "./prism"

export default merge({}, typography, {
  colors,
  styles,
  prism,
})
