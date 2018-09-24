import React from "react"

import { rhythm } from "../../utils/typography"
import { colors } from "../../utils/presets"

const Badge = ({ forHire, children, customCSS }) => (
  <div
    css={[
      styles.badge,
      forHire ? styles.forHire : styles.hiring,
      { letterSpacing: customCSS ? `0.025em` : null },
      customCSS && forHire ? customCSS : {},
    ]}
  >
    {children}
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
    color: `#2b7e2b`,
  },
}
