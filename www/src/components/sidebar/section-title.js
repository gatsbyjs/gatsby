/** @jsx jsx */
import { jsx } from "theme-ui"
import { t } from "@lingui/macro"
import { withI18n } from "@lingui/react"

import ChevronSvg from "./chevron-svg"
import indention from "../../utils/sidebar/indention"
import ItemLink from "./item-link"
import { useSidebarContext } from "./sidebar"

const Chevron = ({ isExpanded }) => (
  <span
    sx={{
      display: `flex`,
      flexShrink: 0,
      ml: `auto`,
      height: `100%`,
      width: `100%`,
      pt: `1.3em`,
      minHeight: `sidebarItemMinHeight`,
      minWidth: `sidebarItemMinHeight`,
      "&:hover": {
        backgroundColor: `sidebar.activeSectionBackground`,
      },
    }}
  >
    <ChevronSvg
      cssProps={{
        color: `textMuted`,
        mx: `auto`,
        transform: isExpanded ? `rotate(180deg)` : `rotate(270deg)`,
        transition: t =>
          `transform ${t.transition.speed.fast} ${t.transition.curve.default}`,
      }}
    />
  </span>
)

// Common styled heading component used in different types of SectionTitles
const SectionHeading = ({ children, disabled, item }) => {
  const { getItemState } = useSidebarContext()
  const { isExpanded } = getItemState(item)
  return (
    <h3
      sx={{
        alignItems: `center`,
        display: `flex`,
        fontSize: 1,
        // fontFamily: "body",
        // fontWeight: isActive ? `bold` : `body`,
        fontWeight: `body`,
        textTransform: `uppercase`,
        letterSpacing: `tracked`,
        margin: 0,
        ...(item.level === 0 && styles.level0),
        color:
          isExpanded && !disabled
            ? `gatsby`
            : disabled
            ? `navigation.linkDefault`
            : false,
        "&:hover": {
          color: !disabled && `gatsby`,
        },
      }}
    >
      {children}
    </h3>
  )
}

// A title with no interactability
const Title = ({ item }) => (
  <div
    sx={{
      alignItems: `center`,
      display: `flex`,
      paddingLeft: indention(item.level),
      minHeight: 40,
    }}
  >
    <SectionHeading disabled item={item}>
      {item.title}
    </SectionHeading>
  </div>
)

// A title rendered as a button that can be clicked to expand/collapse
// but does not represent a page itself
const TitleButton = ({ item, uid }) => {
  const { onSectionTitleClick, getItemState } = useSidebarContext()
  const { isExpanded } = getItemState(item)
  return (
    <button
      aria-expanded={isExpanded}
      aria-controls={uid}
      sx={{
        ...styles.resetButton,
        ...styles.button,
        pl: item.level === 0 ? 6 : 0,
        pr: `0 !important`,
        minHeight: 40,
        "&:before": {
          bg: `itemBorderColor`,
          content: `''`,
          height: 1,
          position: `absolute`,
          right: 0,
          bottom: 0,
          left: t => (item.level === 0 ? t.space[6] : 0),
          top: `auto`,
        },
      }}
      onClick={() => onSectionTitleClick(item)}
    >
      <SectionHeading item={item}>
        {item.title}
        <span
          sx={{
            position: `absolute`,
            top: 0,
            bottom: 0,
            right: 0,
            minHeight: `sidebarItemMinHeight`,
            width: `sidebarItemMinHeight`,
          }}
        >
          <Chevron isExpanded={isExpanded} />
        </span>
      </SectionHeading>
    </button>
  )
}

// A split title with a link that can be navigated to, and a button
// that can expand it
const SplitButton = withI18n()(({ i18n, itemRef, item, uid }) => {
  const { getItemState, onSectionTitleClick } = useSidebarContext()
  const { isExpanded } = getItemState(item)
  return (
    <span
      ref={itemRef}
      css={{
        alignItems: `flex-end`,
        display: `flex`,
        position: `relative`,
        width: `100%`,
      }}
    >
      <span
        sx={{
          // borderRightWidth: "1px",
          // borderRightStyle: "solid",
          // borderRightColor: "sidebar.itemBorderColor"
          flexGrow: 1,
        }}
      >
        <ItemLink
          item={item}
          overrideCSS={{
            "&&": item.level === 0 && item.ui !== `steps` && styles.level0,
            pr: t => t.sizes.sidebarItemMinHeight,
          }}
        />
      </span>
      <button
        aria-controls={uid}
        aria-expanded={isExpanded}
        aria-label={
          isExpanded
            ? i18n._(t`${item.title} collapse`)
            : i18n._(t`${item.title} expand`)
        }
        sx={{
          ...styles.resetButton,
          bottom: 0,
          ml: `auto`,
          minHeight: `sidebarItemMinHeight`,
          position: `absolute`,
          right: 0,
          top: 0,
          width: `sidebarItemMinHeight`,
          zIndex: 1,
        }}
        onClick={() => onSectionTitleClick(item)}
      >
        <Chevron isExpanded={isExpanded} />
      </button>
    </span>
  )
})

export default function SectionTitle({ itemRef, item, uid }) {
  const { disableAccordions } = useSidebarContext()
  // If the item has a link, render it as a combination link and toggle button
  if (item.link) {
    return <SplitButton itemRef={itemRef} item={item} uid={uid} />
  }
  // Otherwise, render the toggle button depending on if toggling is enabled
  const SectionTitleComponent = disableAccordions ? Title : TitleButton
  return <SectionTitleComponent item={item} uid={uid} />
}

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
  level0: {
    fontFamily: `heading`,
    letterSpacing: `tracked`,
    textTransform: `uppercase`,
    fontSize: 1,
  },
}
