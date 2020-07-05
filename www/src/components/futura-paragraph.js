/** @jsx jsx */
import { jsx } from "theme-ui"

export default function FuturaParagraph({ children }) {
  return (
    <p
      sx={{
        fontFamily: `heading`,
        fontSize: 3,
        mb: 0,
      }}
    >
      {children}
    </p>
  )
}
