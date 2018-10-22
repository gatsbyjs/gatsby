import React from "react"
import PropTypes from "prop-types"
import { css } from "react-emotion"

import presets, { colors } from "../../utils/presets"
import { rhythm, scale, options } from "../../utils/typography"

const TopBanner = () => {
  return (
    <div className={topBanner}>
      <div>
        <div>
          These are the docs for v2.
          {` `}
          <a href="https://v1.gatsbyjs.org/" css={{ color: `#fff` }}>
            View the v1 docs
            <span
              css={{ display: `none`, [presets.Mobile]: { display: `inline` } }}
            >
              {` `}
              instead
            </span>
          </a>
          .
        </div>
      </div>
    </div>
  )
}

TopBanner.propTypes = {}

export default TopBanner

/* STYLES */

const horizontalPadding = rhythm(1 / 2)

const topBanner = css`
  background-color: ${colors.gatsby};
  height: ${presets.bannerHeight};
  position: fixed;
  width: 100%;
  z-index: 3;

  & > div {
    align-items: center;
    display: flex;
    height: ${presets.bannerHeight};
    overflow-x: auto;
    mask-image: linear-gradient(
      to right,
      transparent,
      ${colors.gatsby} ${horizontalPadding},
      ${colors.gatsby} 96%,
      transparent
    );

    & > div {
      color: ${colors.ui.bright};
      font-family: ${options.headerFontFamily.join(`,`)};
      font-size: ${scale(-1 / 5).fontSize};
      webkit-font-smoothing: antialiased;
      padding-left: ${horizontalPadding};
      padding-right: ${horizontalPadding};
      white-space: nowrap;
    }

    .is-homepage & {
      background-color: ${colors.gatsbyDark};

      & > div {
        mask-image: linear-gradient(
          to right,
          transparent,
          ${colors.gatsbyDark} ${horizontalPadding},
          ${colors.gatsbyDark} 96%,
          transparent
        );
      }
    }
  }
`
