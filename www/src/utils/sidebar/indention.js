import { space } from "../../utils/tokens"
import { rhythm } from "../../utils/typography"

const indention = level =>
  level === 0 ? rhythm((level + 1) * space[6]) : rhythm((level + 1) * space[3])

export default indention
