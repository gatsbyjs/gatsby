/* @jsx jsx */
import { jsx } from "theme-ui"
import { keyframes } from "@emotion/core"

const pulse = keyframes({
  "0%": {
    boxShadow: `0 0 0 0 rgba(102, 51, 153, 0.4)`,
  },
  "70%": {
    boxShadow: `0 0 0 30px rgba(102, 51, 153, 0)`,
  },
  "100%": {
    boxShadow: `0 0 0 0 rgba(102, 51, 153, 0)`,
  },
})

export default function App() {
  return jsx(
    `html`,
    null,
    jsx(
      `head`,
      null /*, jsx(`meta`, { httpEquiv: `refresh`, content: `3` }) */
    ),
    jsx(
      `body`,
      null,
      jsx(
        `div`,
        {
          sx: {
            width: `100vw`,
            height: `100vh`,
            position: `absolute`,
            top: `0`,
            left: `0`,
            background: `white`,
            display: `flex`,
            flexDirection: `column`,
            alignItems: `center`,
            justifyContent: `center`,
            color: `rebeccapurple`,
            fontFamily: `'Futura PT', -apple-system, 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'`,
            textAlign: `center`,
          },
        },
        jsx(
          `svg`,
          {
            sx: {
              height: 64,
              width: `auto`,
              boxShadow: `0 0 0 rgba(102, 51, 153, 0.4)`,
              animation: `${pulse} 2s infinite`,
              borderRadius: `50%`,
            },
            xmlns: `http://www.w3.org/2000/svg`,
            viewBox: `0 0 28 28`,
            focusable: `false`,
          },
          jsx(`title`, null, `Gatsby`),
          jsx(`circle`, { cx: `14`, cy: `14`, r: `14`, fill: `#639` }),
          jsx(`path`, {
            fill: `#fff`,
            d: `M6.2 21.8C4.1 19.7 3 16.9 3 14.2L13.9 25c-2.8-.1-5.6-1.1-7.7-3.2zm10.2 2.9L3.3 11.6C4.4 6.7 8.8 3 14 3c3.7 0 6.9 1.8 8.9 4.5l-1.5 1.3C19.7 6.5 17 5 14 5c-3.9 0-7.2 2.5-8.5 6L17 22.5c2.9-1 5.1-3.5 5.8-6.5H18v-2h7c0 5.2-3.7 9.6-8.6 10.7z`,
          })
        ),
        jsx(`h1`, null, `Gatsby is restarting the develop server...`),
        jsx(`script`, {
          src: `/socket.io/socket.io.js`,
        }),
        jsx(`script`, {
          dangerouslySetInnerHTML: {
            __html: `var socket = io(); socket.on('gatsby:develop:restarted', () => { console.log('dafuq'); window.location.reload(); });`,
          },
        })
      )
    )
  )
}
