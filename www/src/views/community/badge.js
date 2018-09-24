import React from "react"

import { rhythm } from "../../utils/typography"
import { colors } from "../../utils/presets"

const Badge = ({ forHire, title }) => (
  <div
    css={[
      styles.badge,
      forHire ? styles.forHire : styles.hiring,
      { letterSpacing: forHire ? `0.025em` : null },
    ]}
  >
    {title}
  </div>
)

export default Badge

const styles = {
  badge: {
    borderRadius: 20,
    padding: `0 ${rhythm(1 / 3)}`,
  },
  hiring: {
    background: colors.ui.light,
    color: colors.lilac,
  },
  forHire: {
    background: `#effaef`,
    color: colors.success,
  },
}
