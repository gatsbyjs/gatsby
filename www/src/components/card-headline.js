/** @jsx jsx */
import { jsx } from "theme-ui"

export default function CardHeadline({ children }) {
  return (
    <h2
      sx={{
        fontSize: 4,
        lineHeight: `dense`,
        mt: 0,
      }}
    >
      {children}
    </h2>
  )
}
