import React from "react"
import Link from "gatsby-link"

import presets, { colors } from "../presets"

const _getTitle = (title, isDraft) => (isDraft ? title.slice(0, -1) : title)
const _isDraft = title => title.slice(-1) === `*`

const createLink = ({
  item,
  onLinkClick,
  isActive,
  isExpanded,
  isParentOfActiveItem,
  stepsUI,
}) => {
  const isDraft = _isDraft(item.title)
  const title = _getTitle(item.title, isDraft)

  return (
    <span
      css={{
        display: `flex`,
        minHeight: 40,
        alignItems: `center`,
        position: `relative`,
        paddingTop: 10,
        paddingBottom: 10,
        "&:before": {
          background: colors.ui.border,
          bottom: 0,
          top: `auto`,
          content: ` `,
          height: 1,
          position: `absolute`,
          right: 0,
          left: 0,
        },
      }}
    >
      <Link
        css={[
          styles.link,
          isDraft && styles.draft,
          isActive && styles.activeLink,
          isExpanded && styles.activeWorkaround,
          isParentOfActiveItem && styles.parentOfActiveLink,
        ]}
        onClick={onLinkClick}
        to={item.link}
      >
        {stepsUI && <span css={{ ...styles.subsectionLink }} />}
        {title}
      </Link>
    </span>
  )
}

const bulletOffset = {
  default: {
    left: `-25px`,
    top: `.35em`,
  },
  desktop: {
    top: `.4em`,
  },
}

const bulletSize = 8

const styles = {
  draft: {
    "&&": {
      color: colors.gray.calm,
      // fontStyle: `italic`,
    },
  },
  parentOfActiveLink: {
    "&:before, &:after": {
      display: `none`,
    },
  },
  activeWorkaround: {
    "&&": {
      color: colors.gatsby,
      fontWeight: `bold`,
    },
  },
  activeLink: {
    "&&": {
      color: colors.gatsby,
      fontWeight: `bold`,
    },
    "&:before": {
      background: colors.gatsby,
      transform: `scale(1)`,
    },
    "&:after": {
      width: 200,
      opacity: 1,
    },
  },
  link: {
    paddingRight: 40,
    position: `relative`,
    zIndex: 1,
    width: `100%`,
    "&&": {
      border: 0,
      boxShadow: `none`,
      fontWeight: `normal`,
      "&:hover": {
        background: `transparent`,
        color: colors.gatsby,
        "&:before": {
          background: colors.gatsby,
          transform: `scale(1)`,
        },
      },
    },
    "&:before, &:after": {
      ...bulletOffset.default,
      height: bulletSize,
      position: `absolute`,
      transition: `all ${presets.animation.speedDefault} ${
        presets.animation.curveDefault
      }`,
    },
    "&:before": {
      borderRadius: `100%`,
      content: ` `,
      transform: `scale(0.1)`,
      width: bulletSize,
      [presets.Tablet]: {
        ...bulletOffset.desktop,
      },
    },
    "&:after": {
      background: colors.gatsby,
      borderRadius: 4,
      content: ` `,
      left: `-0.6rem`,
      opacity: 0,
      transform: `translateX(-200px)`,
      width: 1,
      [presets.Tablet]: {
        ...bulletOffset.desktop,
        left: `-0.6rem`,
      },
    },
  },
  subsectionLink: {
    ...bulletOffset.default,
    background: `#fff`,
    border: `1px solid ${colors.ui.bright}`,
    borderRadius: `100%`,
    display: `block`,
    fontWeight: `normal`,
    height: bulletSize,
    position: `absolute`,
    width: bulletSize,
    zIndex: -1,
    [presets.Tablet]: {
      ...bulletOffset.desktop,
    },
  },
}

export default createLink
