import React from "react"
import MdClear from "react-icons/lib/md/clear"

import { options, scale, rhythm } from "../../utils/typography"
import presets, { colors } from "../../utils/presets"

const ResetFilters = ({ onClick }) => (
  <div css={{ paddingRight: rhythm(3 / 4) }}>
    <button
      css={{
        ...scale(-1 / 6),
        alignItems: `center`,
        background: colors.ui.light,
        border: 0,
        borderRadius: presets.radius,
        color: colors.gatsby,
        cursor: `pointer`,
        display: `flex`,
        fontFamily: options.headerFontFamily.join(`,`),
        marginTop: rhythm(options.blockMarginBottom),
        paddingRight: rhythm(3 / 4),
        textAlign: `left`,
        "&:hover": {
          background: colors.gatsby,
          color: `#fff`,
        },
      }}
      onClick={onClick}
    >
      <MdClear style={{ marginRight: rhythm(1 / 4) }} /> Reset all Filters
    </button>
  </div>
)

export default ResetFilters
