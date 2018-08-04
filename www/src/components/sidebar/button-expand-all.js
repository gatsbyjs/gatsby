import React, { Fragment } from "react"
import GoFold from "react-icons/lib/go/fold"
import GoUnfold from "react-icons/lib/go/unfold"

import presets, { colors } from "../../utils/presets"
import { scale, options } from "../../utils/typography"

const ExpandAllButton = ({ onClick, expandAll }) => (
  <div
    css={{
      position: `fixed`,
      top: `calc(${presets.bannerHeight} + ${presets.headerHeight} + 119px)`,
      left: 0,
      zIndex: 10,
    }}
  >
    <button
      onClick={onClick}
      css={{
        transform: `rotate(-90deg)`,
        transformOrigin: `top left`,
        ...scale(-2 / 3),
        background: colors.ui.bright,
        border: `none`,
        borderBottomLeftRadius: presets.radius,
        borderBottomRightRadius: presets.radius,
        color: colors.gatsby,
        display: `flex`,
        cursor: `pointer`,
        paddingLeft: 10,
        paddingRight: 6,
        opacity: 0.75,
        fontFamily: options.systemFontFamily.join(`,`),
        textAlign: `left`,
        transition: `opacity .2s`,
        width: 120,
        "&:hover": {
          opacity: 1,
        },
      }}
    >
      {expandAll ? (
        <Fragment>
          Collapse All
          <span
            css={{
              display: `inline-block`,
              fontSize: `.9rem`,
              marginLeft: `auto`,
              transform: `rotate(90deg)`,
            }}
          >
            <GoFold />
          </span>
        </Fragment>
      ) : (
        <Fragment>
          Expand All
          <span
            css={{
              display: `inline-block`,
              fontSize: `.9rem`,
              marginLeft: `auto`,
              transform: `rotate(90deg)`,
            }}
          >
            <GoUnfold />
          </span>
        </Fragment>
      )}
    </button>
  </div>
)

export default ExpandAllButton
