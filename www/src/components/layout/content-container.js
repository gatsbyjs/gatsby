import React from "react"
import PropTypes from "prop-types"
import { css } from "react-emotion"

import presets from "../../utils/presets"

import { rhythm, options } from "../../utils/typography"

const contentContainer = css`
  background: red;
  position: relative;
`

const ContentContainer = ({ children, hasSideBar = false }) => (
  <div
    className={contentContainer}
    css={{
      maxWidth: hasSideBar
        ? rhythm(presets.maxWidthWithSidebar)
        : rhythm(presets.maxWidth),
      margin: `0 auto`,
      padding: `${rhythm(1.5)} ${rhythm(options.blockMarginBottom)}`,
      paddingBottom: rhythm(3.5),

      [presets.Tablet]: {
        paddingBottom: rhythm(1.5),
      },
    }}
  >
    {children}
  </div>
)

ContentContainer.propTypes = {
  children: PropTypes.node.isRequired,
  hasSideBar: PropTypes.bool,
}

export default ContentContainer
