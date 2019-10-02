/** @jsx jsx */
import { jsx } from "theme-ui"
import { keyframes } from "@emotion/core"

export default ({ items, color }) => (
  <span
    css={{
      "& span": {
        animation: `${topToBottom} 5s linear infinite 0s`,
        opacity: 0,
      },
    }}
  >
    {items.map(item => (
      <span key={item} sx={{ color: color }}>
        {item}
      </span>
    ))}
  </span>
)

const topToBottom = keyframes({
  "0%": {
    opacity: 0,
  },
  "6%": {
    opacity: 0,
  },
  "21%": {
    opacity: 1,
  },
  "69%": {
    opacity: 1,
  },
  "84%": {
    opacity: 0,
  },
  "90%": {
    opacity: 0,
  },
  "100%": {
    opacity: 0,
  },
})
