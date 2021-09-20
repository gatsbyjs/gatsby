/** @jsx jsx */
import { jsx } from "theme-ui"
import { forwardRef } from "react"
import { hexToRGBA } from "gatsby-interface"

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
        bg: `secondaryBackground`,
        borderWidth: t => t.space[3],
        borderStyle: `solid`,
        borderColor: selected ? `${baseColor}.60` : `transparent`,
        borderRadius: 3,
        color: `text.secondary`,
        cursor: `pointer`,
        fontWeight: selected ? `bold` : `body`,
        p: t => t.space[3],
        ":focus": {
          boxShadow: t =>
            `0 0 0 3px ${hexToRGBA(t.colors[baseColor][30], 0.5, true)}`,
          outline: 0,
        },
        ":hover": {
          borderColor: `${baseColor}.60`,
        },
      }}
    >
      <span
        sx={{
          display: `flex`,
          flexDirection: `column`,
          p: t => t.space[3],
        }}
      >
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
