import React from "react"
import { colors } from "../../utils/presets"

const SvgDefs = props => (
  <svg
    width="0"
    height="0"
    viewBox="0 0 0 0"
    version={1.1}
    xmlnsXlink="http://www.w3.org/1999/xlink"
    {...props}
  >
    <defs>
      <linearGradient id="accent-white-top" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset={0} style={{ stopColor: `#FFFFFF`, stopOpacity: 0 }} />
        <stop offset={0.35} style={{ stopColor: `#FFFFFF`, stopOpacity: 0 }} />
        <stop offset={1} style={{ stopColor: colors.accent }} />
      </linearGradient>
      <linearGradient
        id="accent-white-bottom"
        x1="0%"
        y1="0%"
        x2="0%"
        y2="100%"
      >
        <stop offset={0} style={{ stopColor: `#FFFFFF` }} />
        <stop offset={0.65} style={{ stopColor: `#FFFFFF` }} />
        <stop offset={1} style={{ stopColor: colors.accent }} />
      </linearGradient>
      <linearGradient id="accent-white-45deg" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset={0} style={{ stopColor: `#FFFFFF`, stopOpacity: 0 }} />
        <stop offset={1} style={{ stopColor: colors.accent }} />
      </linearGradient>
      <linearGradient id="lilac-gatsby" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset={0} style={{ stopColor: colors.lilac }} />
        <stop offset={1} style={{ stopColor: colors.gatsby }} />
      </linearGradient>
      <linearGradient id="purple-top" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset={0} style={{ stopColor: colors.gatsby }} />
        <stop offset={1} style={{ stopColor: colors.lilac }} />
      </linearGradient>
    </defs>
  </svg>
)

export default SvgDefs
