import React from "react"

import { colors, space, letterSpacings } from "../../utils/presets"

const Badge = ({ forHire, children, customCSS }) => (
  <div
    css={[
      styles.badge,
      forHire ? styles.forHire : styles.hiring,
      { letterSpacing: customCSS ? letterSpacings.tracked : null },
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
    padding: `0 ${space[2]}`,
  },
  hiring: {
    background: colors.purple[10],
    color: colors.lilac,
  },
  forHire: {
    background: `#effaef`,
    color: `#2b7e2b`,
  },
}
