import React from "React"

import { rhythm, scale } from "../../utils/typography"
import { colors } from "../../utils/presets"

const Badge = ({ forHire, title }) => (
  <div css={[styles.badge, forHire ? styles.forHire : styles.hiring]}>
    {title}
  </div>
)

export default Badge

const styles = {
  badge: {
    ...scale(-1 / 2),
    lineHeight: 1.5,
    padding: `0 ${rhythm(1 / 3)}`,
    borderRadius: 20,
    alignSelf: `flex-start`,
  },
  hiring: {
    background: colors.ui.light,
    color: colors.gatsby,
  },
  forHire: {
    background: colors.success,
    color: `white`,
  },
}
