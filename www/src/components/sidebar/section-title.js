import React from "react"

import ChevronSvg from "./chevron-svg"
import {
  colors,
  transition,
  fontSizes,
  letterSpacings,
  space,
  fonts,
} from "../../utils/presets"
import indention from "../../utils/sidebar/indention"
import presets from "../../utils/sidebar/presets"

const Chevron = ({ isExpanded }) => (
  <span
    css={{
      display: `flex`,
      flexShrink: 0,
      marginLeft: `auto`,
      height: `100%`,
      width: `100%`,
      paddingTop: `1.3em`,
      minHeight: presets.itemMinHeight,
      minWidth: presets.itemMinHeight,
      "&:hover": {
        background: presets.activeSectionBackground,
      },
    }}
  >
    <ChevronSvg
      cssProps={{
        color: colors.text.secondary,
        marginLeft: `auto`,
        marginRight: `auto`,
        transform: isExpanded ? `rotate(180deg)` : `rotate(270deg)`,
        transition: `transform ${transition.speed.fast} ${transition.curve.default}`,
      }}
    />
  </span>
)

const TitleButton = ({
  isActive,
  isExpanded,
  item,
  onSectionTitleClick,
  uid,
}) => (
  <button
    aria-expanded={isExpanded}
    aria-controls={uid}
    css={{
      ...styles.resetButton,
      ...styles.button,
      paddingLeft: item.level === 0 ? space[6] : 0,
      paddingRight: `0 !important`,
      minHeight: 40,
      "&:before": {
        ...styles.ulHorizontalDivider,
        bottom: 0,
        left: item.level === 0 ? space[6] : 0,
        top: `auto`,
      },
    }}
    onClick={() => onSectionTitleClick(item)}
  >
    <SectionTitle isExpanded={isExpanded} isActive={isActive} item={item}>
      {item.title}
      <span
        css={{
          position: `absolute`,
          top: 0,
          bottom: 0,
          right: 0,
          minHeight: presets.itemMinHeight,
          width: presets.itemMinHeight,
        }}
      >
        <Chevron isExpanded={isExpanded} />
      </span>
    </SectionTitle>
  </button>
)

const SplitButton = ({
  createLink,
  isActive,
  isExpanded,
  isParentOfActiveItem,
  item,
  location,
  onLinkClick,
  onSectionTitleClick,
  uid,
}) => (
  <span
    css={{
      alignItems: `flex-end`,
      display: `flex`,
      position: `relative`,
      width: `100%`,
    }}
  >
    <span
      css={{
        flexGrow: 1,
        // borderRight: `1px solid ${presets.itemBorderColor}`,
      }}
    >
      {createLink({
        isActive,
        isExpanded,
        isParentOfActiveItem,
        item,
        location,
        onLinkClick,
        level: item.level,
        customCSS: {
          ...(item.level === 0 &&
            item.ui !== `steps` && {
              "&&": {
                ...styles.level0,
                color:
                  (isParentOfActiveItem && isExpanded) || isActive
                    ? colors.link.color
                    : colors.text.primary,
              },
            }),
          paddingRight: presets.itemMinHeight,
        },
      })}
    </span>
    <button
      aria-controls={uid}
      aria-expanded={isExpanded}
      aria-label={item.title + (isExpanded ? ` collapse` : ` expand`)}
      css={{
        ...styles.resetButton,
        marginLeft: `auto`,
        position: `absolute`,
        top: 0,
        bottom: 0,
        right: 0,
        minHeight: presets.itemMinHeight,
        width: presets.itemMinHeight,
        zIndex: 1,
      }}
      onClick={() => onSectionTitleClick(item)}
    >
      <Chevron isExpanded={isExpanded} />
    </button>
  </span>
)

const Title = ({ item, isActive, isExpanded }) => (
  <div
    css={{
      alignItems: `center`,
      display: `flex`,
      paddingLeft: indention(item.level),
      minHeight: 40,
    }}
  >
    <SectionTitle
      disabled
      isActive={isActive}
      isExpanded={isExpanded}
      item={item}
    >
      {item.title}
    </SectionTitle>
  </div>
)

const SectionTitle = ({ children, isExpanded, isActive, disabled, item }) => (
  <h3
    css={{
      alignItems: `center`,
      display: `flex`,
      fontSize: fontSizes[1],
      // fontFamily: fonts.system,
      // fontWeight: isActive ? `bold` : `normal`,
      fontWeight: `normal`,
      textTransform: `uppercase`,
      letterSpacing: letterSpacings.tracked,
      margin: 0,
      ...(item.level === 0 && { ...styles.level0 }),
      color:
        isExpanded && !disabled
          ? colors.gatsby
          : disabled
          ? colors.text.secondary
          : false,
      "&:hover": {
        color: disabled ? false : colors.gatsby,
      },
    }}
  >
    {children}
  </h3>
)

export { Title, TitleButton, SplitButton }

const styles = {
  resetButton: {
    backgroundColor: `transparent`,
    border: 0,
    cursor: `pointer`,
    padding: 0,
  },
  button: {
    position: `relative`,
    textAlign: `left`,
    width: `100%`,
  },
  ulHorizontalDivider: {
    background: presets.itemBorderColor,
    top: 0,
    content: `''`,
    height: 1,
    position: `absolute`,
    right: 0,
    left: space[6],
  },
  level0: {
    fontFamily: fonts.header,
    letterSpacing: letterSpacings.tracked,
    textTransform: `uppercase`,
    fontSize: fontSizes[1],
  },
}
