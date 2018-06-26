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
        return subitem.link === activeItemId && item.link === subitem.parentLink
      })

      return matches.length >= 1
    }
  }

  render() {
    const {
      activeItemHash,
      createLink,
      location,
      onLinkClick,
      onSectionTitleClick,
      section,
      hideSectionTitle,
    } = this.props
    const uid = `section_` + this.state.uid
    const activeItemId = getActiveItem(section, location, activeItemHash)
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
              key={item.link}
              css={{
                ...((item.subitems && item.link === activeItemId) ||
                this._isChildItemActive(item, activeItemId)
                  ? { ...styles.liActive }
                  : {}),
              }}
            >
              {createLink({
                isActive:
                  item.link === activeItemId ||
                  this._isChildItemActive(item, activeItemId),
                item,
                section,
                location,
                onLinkClick,
                isParentOfActiveItem: this._isChildItemActive(
                  item,
                  activeItemId
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
                    <li key={subitem.link}>
                      {createLink({
                        isActive: subitem.link === activeItemId,
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
    backgroundColor: `transparent`,
    border: 0,
    cursor: `pointer`,
    padding: 0,
    paddingLeft: rhythm(1),
    paddingRight: rhythm(1),
    textAlign: `left`,
    width: `100%`,
  },
  liActive: {
    background: hex2rgba(colors.ui.bright, 0.35),
    paddingTop: `${rhythm(1 / 2)} !important`,
    marginTop: `${rhythm(1 / 2)} !important`,
    marginBottom: `${rhythm(1)} !important`,
  },
}
