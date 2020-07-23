/** @jsx jsx */
import { jsx } from "theme-ui"
import { forwardRef } from "react"
import { colors } from "gatsby-design-tokens/dist/theme-gatsbyjs-org"
import hex2rgba from "hex2rgba"

export default forwardRef(function LayerTab(
  { layer, onClick, selected, index },
  ref
) {
  const { baseColor, title, icon } = layer

  return (
    <button
      id={`tab${index}`}
      ref={ref}
      tabIndex={selected ? 0 : -1}
      role="tab"
      aria-controls={`tabpanel${index}`}
      aria-selected={selected}
      onClick={onClick}
      sx={{
        bg: `ui.background`,
        border: 2,
        borderColor: selected ? `${baseColor}.60` : `transparent`,
        borderRadius: 3,
        color: `textMuted`,
        cursor: `pointer`,
        fontWeight: selected ? `bold` : `body`,
        p: 2,
        ":focus": {
          boxShadow: `0 0 0 3px ${hex2rgba(colors[baseColor][30], 0.5)}`,
          outline: 0,
        },
        ":hover": {
          borderColor: `${baseColor}.60`,
        },
      }}
    >
      <span sx={{ display: `flex`, flexDirection: `column`, p: 2 }}>
        <span
          sx={{ height: 40, color: selected ? `${baseColor}.70` : `grey.50` }}
        >
          {icon}
        </span>
        <span>{title}</span>
      </span>
    </button>
  )
})
