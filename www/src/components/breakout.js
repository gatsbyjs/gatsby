/** @jsx jsx */
import { jsx } from "theme-ui"

export default function Breakout({ children }) {
  return (
    <div
      sx={{
        display: `grid`,
        placeContent: `center`,
        width: `98vw`,
        position: `relative`,
        left: `50%`,
        right: `50%`,
        mx: `-49vw`,
      }}
    >
      {children}
    </div>
  )
}
