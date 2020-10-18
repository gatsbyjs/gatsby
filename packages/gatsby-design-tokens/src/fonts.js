import preval from "preval.macro"

// TODO re:system-ui, keep an eye on https://github.com/primer/css/issues/838
const f = preval`
  const system = body = [
    "-apple-system",
    "BlinkMacSystemFont",
    "Segoe UI",
    "Roboto",
    "Helvetica Neue",
    "Arial",
    "Noto Sans",
    "sans-serif",
    "Apple Color Emoji",
    "Segoe UI Emoji",
    "Segoe UI Symbol",
    "Noto Color Emoji",
  ]

  const sans = inter = ["Inter", ...system]

  const heading = brand = ["Futura PT", ...system]

  const monospace = [
    "SFMono-Regular",
    "Menlo",
    "Monaco",
    "Consolas",
    "Liberation Mono",
    "Courier New",
    "monospace",
  ]

  const serif = ["Georgia", "Times New Roman", "Times", "serif"]

  const fonts = { body, system, sans, heading, brand, monospace, serif }

  let fontsStrings = {}
  for (const fontFamily in fonts) {
    fontsStrings[fontFamily] = fonts[fontFamily].join(", ")
  }

  module.exports = { fonts, fontsStrings }
`

export const fonts = f.fontsStrings
export const fontsLists = f.fonts
