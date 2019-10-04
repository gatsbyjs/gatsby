const system = [
  `-apple-system`,
  `BlinkMacSystemFont`,
  `Segoe UI`,
  `Roboto`,
  `Helvetica Neue`,
  `Arial`,
  `Noto Sans`,
  `sans-serif`,
  `Apple Color Emoji`,
  `Segoe UI Emoji`,
  `Segoe UI Symbol`,
  `Noto Color Emoji`,
]
const header = [`Futura PT`, ...system]
const monospace = [
  `SFMono-Regular`,
  `Menlo`,
  `Monaco`,
  `Consolas`,
  `Liberation Mono`,
  `Courier New`,
  `monospace`,
]
const serif = [`Georgia`, `Times New Roman`, `Times`, `serif`]

// @todo think about naming, e.g.
// system -> sans
// header -> brand
export default { system, header, monospace, serif }
