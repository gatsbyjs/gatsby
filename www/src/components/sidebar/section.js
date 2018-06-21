import React from "react"
import hex2rgba from "hex2rgba"

import getActiveItem from "../../utils/sidebar/get-active-item"
import presets, { colors } from "../../utils/presets"
import { scale, rhythm } from "../../utils/typography"

import SectionTitle from "./section-title"
import ChevronSvg from "./chevron-svg"

const ToggleSectionButton = ({
  title,
  isActive,
  uid,
  hideSectionTitle,
  onSectionTitleClick,
}) => (
  <button
    aria-expanded={isActive}
    aria-controls={uid}
    css={{
      ...styles.button,
      [presets.Tablet]: {
        display: hideSectionTitle ? `none` : `inline`,
      },
    }}
    onClick={onSectionTitleClick}
  >
    <SectionTitle isActive={isActive}>
      {title}
      <ChevronSvg
        cssProps={{
          marginLeft: 7,
          transform: isActive ? `rotateX(180deg)` : `rotateX(0deg)`,
          transition: `transform 0.2s ease`,
          display: `none`,

          [presets.Tablet]: {
            display: `inline-block`,
          },
        }}
      />
    </SectionTitle>
  </button>
)

const Title = ({ title }) => (
  <div
    css={{
      paddingLeft: rhythm(1),
      paddingRight: rhythm(1),
    }}
  >
    <SectionTitle>{title}</SectionTitle>
  </div>
)

class Section extends React.Component {
  state = { uid: (`` + Math.random()).replace(/\D/g, ``) }

  _isChildItemActive = (item, activeItemId) => {
    if (item.subitems) {
      const matches = item.subitems.filter(function(subitem) {
        return subitem.id === activeItemId && item.id === subitem.parentId
      })

      return matches.length >= 1
    }
  }

  render() {
    const {
      activeItemId,
      createLink,
      isScrollSync,
      location,
      onLinkClick,
      onSectionTitleClick,
      section,
      hideSectionTitle,
    } = this.props
    const uid = `section_` + this.state.uid
    const activeItemIdYo = getActiveItem(section, location)
    const SectionTitleComponent = section.disableAccordions
      ? Title
      : ToggleSectionButton

    let { isActive } = this.props
    if (section.disableAccordions) {
      isActive = true
    }

    return (
      <div>
        <SectionTitleComponent
          title={section.title}
          isActive={isActive}
          uid={uid}
          hideSectionTitle={hideSectionTitle}
          onSectionTitleClick={onSectionTitleClick}
        />
        <ul
          id={uid}
          css={{
            ...styles.ul,
            "& li": {
              lineHeight: 1.3,
              paddingTop: rhythm(1 / 8),
              paddingBottom: rhythm(1 / 8),
              paddingLeft: rhythm(1),
              paddingRight: rhythm(1),
              margin: 0,
            },

            [presets.Tablet]: {
              display: isActive ? `block` : `none`,
              "& li": {
                fontSize: scale(-4 / 10).fontSize,
              },
            },
            [presets.Hd]: {
              "& li": {
                fontSize: scale(-3 / 10).fontSize,
              },
            },
          }}
        >
          {section.items.map(item => (
            <li
              key={item.id}
              css={{
                ...((item.subitems && item.id === activeItemId) ||
                (item.subitems && item.id === activeItemIdYo) ||
                this._isChildItemActive(
                  item,
                  isScrollSync ? activeItemId : activeItemIdYo
                )
                  ? { ...styles.foo }
                  : {}),
              }}
            >
              {createLink({
                isActive:
                  (!isScrollSync && item.id === activeItemIdYo) ||
                  (isScrollSync && item.id === activeItemId) ||
                  this._isChildItemActive(
                    item,
                    isScrollSync ? activeItemId : activeItemIdYo
                  ),
                item,
                section,
                location,
                onLinkClick,
                isParentOfActiveItem: this._isChildItemActive(
                  item,
                  isScrollSync ? activeItemId : activeItemIdYo
                ),
              })}
              {item.subitems && (
                <ul
                  css={{
                    ...styles.ul,
                    paddingTop: rhythm(1 / 2),
                    ...(section.directory === `tutorial`
                      ? { ...styles.tutorialSubsection }
                      : {}),
                  }}
                >
                  {item.subitems.map(subitem => (
                    <li key={subitem.id}>
                      {createLink({
                        isActive: isScrollSync
                          ? activeItemId === subitem.id
                          : subitem.id === activeItemIdYo,
                        item: subitem,
                        location,
                        onLinkClick,
                        section,
                        isSubsectionLink: true,
                      })}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>
    )
  }
}

export default Section

const styles = {
  ul: {
    listStyle: `none`,
    margin: 0,
    marginBottom: rhythm(1 / 2),
    position: `relative`,
  },
  tutorialSubsection: {
    "&:before": {
      content: ` `,
      position: `absolute`,
      height: `100%`,
      width: 1,
      left: `.6rem`,
      background: colors.ui.bright,
      zIndex: -2,
      [presets.Tablet]: {
        left: `.55rem`,
      },
    },
  },
  button: {
    cursor: `pointer`,
    backgroundColor: `transparent`,
    border: 0,
    padding: 0,
    paddingLeft: rhythm(1),
    paddingRight: rhythm(1),
    width: `100%`,
    textAlign: `left`,
  },
  foo: {
    background: hex2rgba(colors.ui.bright, 0.35),
    paddingTop: `${rhythm(1 / 2)} !important`,
    marginTop: `${rhythm(1 / 2)} !important`,
    marginBottom: `${rhythm(1)} !important`,
  },
}
