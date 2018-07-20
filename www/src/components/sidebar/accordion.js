import React, { Fragment } from "react"
import hex2rgba from "hex2rgba"

import presets, { colors } from "../../utils/presets"
import { rhythm, options, scale } from "../../utils/typography"
import { css as glam } from "glamor"

import Item from "./item"
import SectionTitle from "./section-title"
import ChevronSvg from "./chevron-svg"

const horizontalPadding = rhythm(3 / 4)
const horizontalPaddingDesktop = rhythm(3 / 2)

const ToggleSectionChevron = ({
  isActive,
  uid,
  hideSectionTitle,
  onSectionTitleClick,
}) => (
  <button
    aria-expanded={isActive}
    aria-controls={uid}
    css={{
      ...styles.resetButton,
      marginLeft: `auto`,
      [presets.Tablet]: {
        display: hideSectionTitle ? `none` : `inline`,
      },
    }}
    onClick={onSectionTitleClick}
  >
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
  </button>
)

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
    <SectionTitle disabled>{title}</SectionTitle>
  </div>
)

const ItemWithSubitems = ({
  section,
  activeItemLink,
  location,
  onLinkClick,
  uid,
  hideSectionTitle,
  onSectionTitleClick,
  itemStyles,
  createLink,
  isActive,
  level,
}) => {
  const SectionTitleComponent = section.disableAccordions
    ? Title
    : ToggleSectionButton

  return (
    <Fragment>
      {section.link ? (
        <span
          css={{
            alignItems: `flex-end`,
            display: `flex`,
            position: `relative`,
            width: `100%`,
            ...itemStyles.item,
            paddingLeft: level === 0 ? `40px !important` : `0px !important`,
          }}
        >
          {createLink({
            isActive: section.link === activeItemLink.link,
            item: section,
            section,
            location,
            onLinkClick,
          })}
          <span
            css={{
              paddingBottom: 2,
              marginLeft: `auto`,
            }}
          >
            <ToggleSectionChevron
              isActive={isActive}
              uid={uid}
              hideSectionTitle={hideSectionTitle}
              onSectionTitleClick={onSectionTitleClick}
            />
          </span>
        </span>
      ) : (
        <SectionTitleComponent
          title={section.title}
          isActive={isActive}
          uid={uid}
          hideSectionTitle={hideSectionTitle}
          onSectionTitleClick={onSectionTitleClick}
        />
      )}
    </Fragment>
  )
}

class Accordion extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      uid: (`` + Math.random()).replace(/\D/g, ``),
      collapsed: props.isActive || false,
    }
    this.handleClick = this.handleClick.bind(this)
  }

  handleClick(...args) {
    this.setState({ collapsed: !this.state.collapsed })
    if (this.props.onClick) {
      this.props.onClick(...args)
    }
  }

  _isChildItemActive = (item, activeItemLink) => {
    if (item.items) {
      const matches = item.items.filter(function(subitem) {
        return (
          subitem.link === activeItemLink.link &&
          item.link === subitem.parentLink
        )
      })

      return matches.length >= 1
    }

    return false
  }

  render() {
    const {
      collapsed = this.state.collapsed,
      createLink,
      location,
      onLinkClick,
      onSectionTitleClick,
      item: section,
      hideSectionTitle,
      activeItemLink,
      itemStyles,
      isFirstItem,
      isLastItem,
      singleSection,
      level,
      activeItemParents,
    } = this.props
    const uid = `section_` + this.state.uid

    return (
      <li
        className="accordion"
        css={{
          position: `relative`,
          marginTop: isFirstItem ? 0 : rhythm(options.blockMarginBottom / 2),
          marginBottom: rhythm(options.blockMarginBottom / 2),
          "&:before": {
            ...(!isFirstItem && { ...styles.ulHorizontalDivider }),
          },
          "&:after": {
            ...(!isLastItem && { ...styles.ulHorizontalDivider }),
            top: `auto`,
            bottom: 0,
          },
        }}
      >
        <ItemWithSubitems
          section={section}
          activeItemLink={activeItemLink}
          location={location}
          onLinkClick={onLinkClick}
          uid={uid}
          hideSectionTitle={hideSectionTitle}
          onSectionTitleClick={this.handleClick}
          itemStyles={itemStyles}
          createLink={createLink}
          isActive={collapsed}
          level={level}
          activeItemParents={activeItemParents}
        />
        <ul
          id={uid}
          css={{
            ...styles.ul,
            ...styles.ulSubitems,
            position: `relative`,
            paddingBottom: rhythm(3 / 4),
            "& li": {
              ...itemStyles.item,
              paddingLeft:
                // blergh ;)
                level === 0
                  ? `${level + 1 * 40}px !important`
                  : `${level + 1 * 20}px !important`,
              paddingRight: `0 !important`,
            },
            [presets.Tablet]: {
              display: collapsed ? `block` : `none`,
            },
          }}
        >
          {section.items.map(item => (
            <Item
              createLink={createLink}
              location={location}
              onLinkClick={onLinkClick}
              onSectionTitleClick={onSectionTitleClick}
              item={item}
              hideSectionTitle={hideSectionTitle}
              singleSection={singleSection}
              activeItemLink={activeItemLink}
              isFirstItem={isFirstItem}
              isLastItem={isLastItem}
              activeItemParents={activeItemParents}
              key={item.title}
              level={level + 1}
              styles={{
                ...(section.ui === `steps` && {
                  ...styles.ulStepsUI,
                }),
              }}
              ui={section.ui}
            />
          ))}
        </ul>
      </li>
    )
  }
}

export default Accordion

glam.insert(`
  .accordion + .accordion {
    margin: 0;
  }

  .item ~ .accordion {
    margin-bottom: 0;
  }

  .accordion + .item {
    margin-top: ${rhythm(options.blockMarginBottom / 2)};
  }

  .accordion + .accordion::before {
    display: none;
  }
`)

const styles = {
  ul: {
    listStyle: `none`,
    margin: 0,
    position: `relative`,
  },
  ulStepsUI: {
    paddingBottom: rhythm(options.blockMarginBottom / 2),
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
  resetButton: {
    backgroundColor: `transparent`,
    border: 0,
    cursor: `pointer`,
    padding: 0,
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
      marginTop: rhythm(options.blockMarginBottom / 2),
      marginBottom: rhythm(options.blockMarginBottom / 2),
      paddingTop: rhythm(options.blockMarginBottom / 2),
    },
  },
  ulSubitems: {
    paddingTop: rhythm(options.blockMarginBottom / 2),
    paddingBottom: rhythm(options.blockMarginBottom / 2),
    [presets.Desktop]: {
      "&& li": {
        paddingLeft: rhythm(3 / 4),
        paddingRight: rhythm(3 / 4),
      },
    },
  },
  ulHorizontalDivider: {
    background: hex2rgba(colors.ui.bright, 0.3),
    top: 0,
    content: ` `,
    height: 1,
    position: `absolute`,
    right: 0,
    left: horizontalPadding,
    [presets.Desktop]: {
      left: horizontalPaddingDesktop,
    },
  },
  liTutorial: {
    "&&": {
      marginBottom: `1rem`,
      "& a": {
        fontWeight: `bold`,
        fontFamily: options.headerFontFamily.join(`,`),
        fontSize: scale(-2 / 10).fontSize,
      },
      "& ul a": {
        fontWeight: `normal`,
        fontFamily: options.systemFontFamily.join(`,`),
        fontSize: scale(-1 / 10).fontSize,
        [presets.Phablet]: {
          fontSize: scale(-2 / 10).fontSize,
        },
        [presets.Tablet]: {
          fontSize: scale(-4 / 10).fontSize,
        },
      },
    },
  },
}
