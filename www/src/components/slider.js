import React from "react"

import { css } from "glamor"

export default ({ items, color }) => (
  <div
    css={{
      display: `inline`,
      textIndent: `8px`,

      "& span": {
        animation: `${topToBottom} 10s linear infinite 0s`,
        opacity: 0,
        position: `absolute`,

        ":nth-child(2)": {
          animationDelay: `2.5s`,
        },

        ":nth-child(3)": {
          animationDelay: `5s`,
        },

        ":nth-child(4)": {
          animationDelay: `7.5s`,
        },
      },
    }}
  >
    {items.map(item => (
      <span key={item} css={{ color }}>
        {item}
      </span>
    ))}
  </div>
)

const topToBottom = css.keyframes({
  "0%": {
    opacity: 0,
  },
  "6%": {
    opacity: 0,
    transform: `translateY(-30px)`,
  },
  "10%": {
    opacity: 1,
    transform: `translateY(0px)`,
  },
  "25%": {
    opacity: 1,
    transform: `translateY(0px)`,
  },
  "29%": {
    opacity: 0,
    transform: `translateY(30px)`,
  },
  "80%": {
    opacity: 0,
  },
  "100%": {
    opacity: 0,
  },
})
