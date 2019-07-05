import { space } from "../../utils/tokens"
import { rhythm } from "../../utils/typography"

const indention = level =>
  level === 0 || level === 1 ? rhythm(space[6]) : rhythm(level * space[6])

export default indention
