import { createGlobalTheme } from "@vanilla-extract/css"

export const vars = createGlobalTheme(`:host`, {
  color: {
    black: `#000`,
    white: `#fff`,
    dimmedWhite: `rgba(255, 255, 255, 0.8)`,
    "purple-10": `#f6edfa`,
    "purple-20": `#f1defa`,
    "purple-40": `#b17acc`,
    "purple-60": `#663399`,
    "gray-10": `#f3f3f3`,
    "gray-90": `#232129`,
  },
})
