/** @jsx jsx */
import { jsx } from "theme-ui"

const Badge = ({ forHire, children, overrideCSS }) => (
  <div
    sx={{
      ...styles.badge,
      ...(forHire ? styles.forHire : styles.hiring),
      letterSpacing: overrideCSS ? `tracked` : null,
      ...(overrideCSS && forHire ? overrideCSS : {}),
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
    bg: `green.50`,
    color: `white`,
  },
}
