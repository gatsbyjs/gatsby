import React from "react"

import presets, { colors } from "../utils/presets"
import { rhythm, scale, options } from "../utils/typography"

const Banner = ({ children, background }) => {
  const backgroundColor = background ? background : colors.gatsby

  return (
    <div
      className="banner"
      css={{
        backgroundColor: backgroundColor,
        height: presets.bannerHeight,
        position: `fixed`,
        width: `100%`,
        zIndex: `3`,
      }}
    >
      <div
        css={{
          alignItems: `center`,
          display: `flex`,
          height: presets.bannerHeight,
          overflowX: `auto`,
          maskImage: `linear-gradient(to right, transparent, ${backgroundColor} 4%, ${backgroundColor} 96%, transparent)`,
        }}
      >
        <div
          css={{
            color: colors.ui.bright,
            fontFamily: options.headerFontFamily.join(`,`),
            fontSize: scale(-1 / 5).fontSize,
            paddingLeft: rhythm(1 / 2),
            paddingRight: rhythm(1 / 2),
            WebkitFontSmoothing: `antialiased`,
            whiteSpace: `nowrap`,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

export default Banner
