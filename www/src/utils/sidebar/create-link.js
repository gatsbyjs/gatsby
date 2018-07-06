import Link from "gatsby-link"
import React from "react"
import presets, { colors } from "../presets"
import { options, rhythm } from "../typography"

const _getTitle = (title, isDraft) => (isDraft ? title.slice(0, -1) : title)
const _isDraft = title => title.slice(-1) === `*`

const createLinkDocs = ({
  item,
  isActive,
  onLinkClick,
  isParentOfActiveItem,
  stepsUI,
}) => {
  const isDraft = _isDraft(item.title)
  const title = _getTitle(item.title, isDraft)

  return (
    <Link
      css={[
        styles.link,
        isDraft && styles.draft,
        isActive && styles.activeLink,
        isParentOfActiveItem && styles.parentOfActiveLink,
      ]}
      onClick={onLinkClick}
      to={`${item.link}`}
    >
      {stepsUI && <span css={{ ...styles.subsectionLink }} />}
      {title}
    </Link>
  )
}

const createLinkTutorial = ({
  item,
  onLinkClick,
  isActive,
  isParentOfActiveItem,
  stepsUI,
}) => {
  const isDraft = _isDraft(item.title)
  const title = _getTitle(item.title, isDraft)

  return (
    <Link
      css={[
        styles.link,
        isDraft && styles.draft,
        isActive && styles.activeLink,
        isParentOfActiveItem && styles.parentOfActiveLink,
      ]}
      onClick={onLinkClick}
      to={`${item.link}`}
    >
      {stepsUI && <span css={{ ...styles.subsectionLink }} />}
      {title}
    </Link>
  )
}

const bulletOffset = {
  default: {
    left: `-1rem`,
    top: `.6em`,
  },
  desktop: {
    top: `.55em`,
  },
}

const bulletSize = 8

const styles = {
  draft: {
    "&&": {
      color: colors.gray.calm,
      fontStyle: `italic`,
    },
  },
  parentOfActiveLink: {
    "&:after": {
      display: `none`,
    },
    "&:before": {
      display: `none`,
    },
  },
  activeLink: {
    "&&": {
      color: colors.gatsby,
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
    display: `block`,
    paddingTop: rhythm(1 / 8),
    paddingBottom: rhythm(1 / 8),
    position: `relative`,
    zIndex: 1,
    "&&": {
      border: 0,
      boxShadow: `none`,
      fontFamily: options.systemFontFamily.join(`,`),
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
    "&:before": {
      ...bulletOffset.default,
      borderRadius: `100%`,
      content: ` `,
      fontWeight: `normal`,
      height: bulletSize,
      position: `absolute`,
      transform: `scale(0.1)`,
      transition: `all ${presets.animation.speedDefault} ${
        presets.animation.curveDefault
      }`,
      width: bulletSize,
      [presets.Tablet]: {
        ...bulletOffset.desktop,
      },
    },
    "&:after": {
      ...bulletOffset.default,
      background: colors.gatsby,
      borderRadius: 4,
      content: ` `,
      height: bulletSize,
      left: `-0.6rem`,
      opacity: 0,
      position: `absolute`,
      transform: `translateX(-200px)`,
      transition: `all ${presets.animation.speedDefault} ${
        presets.animation.curveDefault
      }`,
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

export { createLinkDocs, createLinkTutorial }
