import React from "react"
import { Link } from "gatsby"

import { colors, space, transition, radii } from "../presets"
import presets from "../../utils/sidebar/presets"
import indention from "../../utils/sidebar/indention"

const _getTitle = (title, isDraft) => (isDraft ? title.slice(0, -1) : title)
const _isDraft = title => title.slice(-1) === `*`

const bulletSize = 8
const bulletSizeActive = 100
const bulletOffsetTop = `1.3em`

const createLink = ({
  item,
  onLinkClick,
  isActive,
  isParentOfActiveItem,
  ui,
  customCSS,
  level,
}) => {
  const isDraft = _isDraft(item.title)
  const title = _getTitle(item.title, isDraft)
  const indent = ui === `steps` ? indention(level + 1) : indention(level)

  return (
    <span
      css={{
        display: `flex`,
        alignItems: `center`,
        position: `relative`,
        "&:before": {
          background: presets.itemBorderColor,
          bottom: 0,
          top: `auto`,
          content: `''`,
          height: 1,
          position: `absolute`,
          right: 0,
          left: indent,
        },
      }}
    >
      <Link
        css={[
          styles.link,
          isDraft && styles.draft,
          isActive && styles.activeLink,
          isParentOfActiveItem && styles.parentOfActiveLink,
          customCSS,
          { paddingLeft: indent },
          {
            "&:before, &:after": {
              content: `''`,
              left:
                level === 0 || (level === 1 && ui !== `steps`)
                  ? `calc(${indent} - ${space[4]})`
                  : `calc(${indent} - ${space[6]})`,
              top: bulletOffsetTop,
              height: bulletSize,
              position: `absolute`,
              transition: `all ${transition.speed.default} ${transition.curve.default}`,
              width: bulletSize,
            },
            "&:before": {
              background: isActive ? colors.link.color : false,
              borderRadius: radii[6],
              transform: isActive ? `scale(1)` : `scale(0.1)`,
            },
            "&:after": {
              background: colors.link.color,
              borderRadius: radii[2],
              opacity: isActive ? 1 : 0,
              transform: `translateX(-${bulletSizeActive - bulletSize}px)`,
              width: isActive ? bulletSizeActive : 0,
            },
          },
        ]}
        onClick={onLinkClick}
        to={item.link}
      >
        {ui === `steps` && (
          <span
            css={{
              left: space[6],
              background: colors.white,
              border: `1px solid ${colors.ui.border.subtle}`,
              borderRadius: radii[6],
              display: `block`,
              fontWeight: `normal`,
              height: bulletSize,
              position: `absolute`,
              width: bulletSize,
              top: bulletOffsetTop,
              zIndex: -1,
            }}
          />
        )}
        {title}
      </Link>
    </span>
  )
}

const styles = {
  draft: {
    "&&": {
      color: colors.text.secondary,
    },
  },
  parentOfActiveLink: {
    "&&": {
      color: colors.link.color,
      fontWeight: 600,
    },
  },
  activeLink: {
    "&&": {
      color: colors.link.color,
      fontWeight: 600,
      background: presets.activeItemBackground,
    },
  },
  link: {
    paddingRight: space[4],
    minHeight: presets.itemMinHeight,
    paddingTop: space[3],
    paddingBottom: space[3],
    position: `relative`,
    zIndex: 1,
    width: `100%`,
    "&&": {
      border: 0,
      color: colors.text.primary,
      fontWeight: `normal`,
      "&:hover": {
        background: presets.itemHoverBackground,
        color: colors.gatsby,
        "&:before": {
          background: colors.link.color,
          transform: `scale(1)`,
        },
      },
    },
  },
}

export default createLink
