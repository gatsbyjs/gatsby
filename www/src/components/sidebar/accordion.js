import React from "react"

import presets, { colors } from "../../utils/presets"
import { rhythm } from "../../utils/typography"

import SectionTitle from "./section-title"
import ChevronSvg from "./chevron-svg"

const horizontalPadding = rhythm(3 / 4)
const horizontalPaddingDesktop = rhythm(3 / 2)

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
          color: colors.gray.light,
          marginLeft: `auto`,
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
      paddingLeft: horizontalPadding,
      paddingRight: horizontalPadding,
      [presets.Desktop]: {
        paddingLeft: horizontalPaddingDesktop,
        paddingRight: horizontalPaddingDesktop,
      },
    }}
  >
    <SectionTitle>{title}</SectionTitle>
  </div>
)

class Accordion extends React.Component {
  state = { uid: (`` + Math.random()).replace(/\D/g, ``) }

  _isChildItemActive = (item, activeItemLink) => {
    if (item.subitems) {
      const matches = item.subitems.filter(function(subitem) {
        return (
          subitem.link === activeItemLink && item.link === subitem.parentLink
        )
      })

      return matches.length >= 1
    }
  }

  render() {
    const {
      createLink,
      location,
      onLinkClick,
      onSectionTitleClick,
      section,
      hideSectionTitle,
      singleSection,
      activeItemLink,
      itemStyles,
      isActive,
    } = this.props
    const uid = `section_` + this.state.uid
    const SectionTitleComponent = section.disableAccordions
      ? Title
      : ToggleSectionButton

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
            ...(!singleSection && { ...styles.ulHorizontalDivider }),
            position: `relative`,
            paddingBottom: rhythm(3 / 4),
            "& li": {
              ...itemStyles.item,
            },
            [presets.Tablet]: {
              display: isActive ? `block` : `none`,
            },
          }}
        >
          {section.items.map(item => (
            <li
              key={item.link}
              css={{
                ...((item.subitems && item.link === activeItemLink) ||
                this._isChildItemActive(item, activeItemLink)
                  ? { ...styles.liActive }
                  : {}),
              }}
            >
              {createLink({
                isActive:
                  item.link === activeItemLink ||
                  this._isChildItemActive(item, activeItemLink),
                item,
                section,
                location,
                onLinkClick,
                isParentOfActiveItem: this._isChildItemActive(
                  item,
                  activeItemLink
                ),
              })}
              {item.subitems && (
                <ul
                  css={{
                    ...styles.ul,
                    ...styles.ulSubitems,
                    ...(item.ui === `steps` && {
                      ...styles.tutorialSubsection,
                    }),
                  }}
                >
                  {item.subitems.map(subitem => (
                    <li key={subitem.link}>
                      {createLink({
                        isActive: subitem.link === activeItemLink,
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

export default Accordion

const styles = {
  ul: {
    listStyle: `none`,
    margin: 0,
    marginBottom: rhythm(1 / 2),
    position: `relative`,
  },
  tutorialSubsection: {
    paddingBottom: 10,
    "&:after": {
      background: colors.ui.bright,
      content: ` `,
      left: `.275rem`,
      top: `1.5rem`,
      bottom: `1.5rem`,
      position: `absolute`,
      width: 1,
    },
    "&:before": {
      content: ` `,
      height: `100%`,
      left: `.275rem`,
      position: `absolute`,
      bottom: 0,
      width: 0,
      borderLeft: `1px dashed ${colors.ui.bright}`,
    },
  },
  button: {
    backgroundColor: `transparent`,
    border: 0,
    cursor: `pointer`,
    padding: 0,
    paddingLeft: horizontalPadding,
    paddingRight: horizontalPadding,
    position: `relative`,
    textAlign: `left`,
    width: `100%`,
    [presets.Desktop]: {
      paddingLeft: horizontalPaddingDesktop,
      paddingRight: horizontalPaddingDesktop,
    },
  },
  liActive: {
    background: colors.ui.light,
    "&&": {
      marginTop: rhythm(1 / 2),
      marginBottom: rhythm(1 / 2),
      paddingTop: rhythm(1 / 2),
    },
  },
  ulSubitems: {
    paddingTop: rhythm(1 / 2),
    [presets.Desktop]: {
      "&& li": {
        paddingLeft: rhythm(3 / 4),
        paddingRight: rhythm(3 / 4),
      },
    },
  },
  ulHorizontalDivider: {
    "&:after": {
      background: colors.ui.light,
      bottom: 0,
      content: ` `,
      height: 1,
      position: `absolute`,
      right: 0,
      left: horizontalPadding,
      [presets.Desktop]: {
        left: horizontalPaddingDesktop,
      },
    },
  },
}
