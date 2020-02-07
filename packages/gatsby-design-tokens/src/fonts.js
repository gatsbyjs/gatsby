import preval from "preval.macro"

// TODO re:system-ui, keep an eye on https://github.com/primer/css/issues/838
// TODO think about naming, e.g.
// system -> sans
// header -> brand
const f = preval`
  const system = [
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
  const heading = ["Futura PT", ...system]
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
  const body = system

  const f = { body, system, heading, monospace, serif }

  let fs = {}
  for (const fontFamily in f) {
    fs[fontFamily] = f[fontFamily].join(", ")
  }

  module.exports = { fonts: f, fontsStrings: fs  }
`

export const fonts = f.fonts
export const fontsStrings = f.fontsStrings
