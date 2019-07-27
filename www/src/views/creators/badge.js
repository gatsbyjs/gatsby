/** @jsx jsx */
import { jsx } from "theme-ui"
import React from "react"

const Badge = ({ forHire, children, customCSS }) => (
  <div
    sx={{
      ...styles.badge,
      ...(forHire ? styles.forHire : styles.hiring),
      letterSpacing: customCSS ? `tracked` : null,
      ...(customCSS && forHire ? customCSS : {}),
    }}
  >
    {children}
  </div>
)

export default Badge

const styles = {
  badge: {
    borderRadius: 20,
    px: 2,
  },
  hiring: {
    bg: `purple.10`,
    color: `lilac`,
  },
  forHire: {
    background: `#effaef`,
    color: `#2b7e2b`,
  },
}
