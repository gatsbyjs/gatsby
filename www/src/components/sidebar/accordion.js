import React, { Fragment } from "react"

import presets, { colors } from "../../utils/presets"
import { rhythm, options, scale } from "../../utils/typography"

import Item from "./item"
import SectionTitle from "./section-title"
import ChevronSvg from "./chevron-svg"

const paddingLeft = level => (level === 0 ? level + 1 * 40 : level + 1 * 20)

const Chevron = ({ isActive }) => (
  <span
    css={{
      display: `none`,
      [presets.Tablet]: {
        display: `flex`,
        width: 40,
        minHeight: 40,
        flexBasis: `40px`,
        flexShrink: 0,
        alignItems: `center`,
        marginLeft: `auto`,
        position: `relative`,
        "&:before": {
          ...styles.ulHorizontalDivider,
          top: `auto`,
          bottom: 0,
          left: `0 !important`,
        },
      },
    }}
  >
    <ChevronSvg
      cssProps={{
        color: isActive ? colors.lilac : colors.ui.bright,
        transform: isActive ? `rotateX(180deg)` : `rotateX(0deg)`,
        transition: `transform 0.2s ease`,
        marginLeft: `auto`,
        marginRight: `auto`,
      }}
    />
  </span>
)

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
      [presets.Tablet]: {
        display: hideSectionTitle ? `none` : `inline`,
      },
      "&:hover": {
        background: `white`,
      },
    }}
    onClick={onSectionTitleClick}
  >
    <Chevron isActive={isActive} />
  </button>
)

const ToggleSectionButton = ({
  title,
  isActive,
  uid,
  level,
  hideSectionTitle,
  onSectionTitleClick,
}) => (
  <button
    aria-expanded={isActive}
    aria-controls={uid}
    css={{
      ...styles.button,
      paddingLeft: level === 0 ? 40 : 0,
      paddingRight: `0 !important`,
      [presets.Tablet]: {
        display: hideSectionTitle ? `none` : `inline`,
      },
      "&:before": {
        ...styles.ulHorizontalDivider,
        top: `auto`,
        bottom: 0,
        left: level === 0 ? 40 : 0,
      },
    }}
    onClick={onSectionTitleClick}
  >
    <SectionTitle isActive={isActive} isSplit={true} level={level}>
      {title}
      <Chevron isActive={isActive} />
    </SectionTitle>
  </button>
)

const Title = ({ title, level, isActive }) => (
  <div
    css={{
      alignItems: `center`,
      display: `flex`,
      paddingLeft: paddingLeft(level),
      minHeight: 40,
    }}
  >
    <SectionTitle disabled isActive={isActive} level={level}>
      {title}
    </SectionTitle>
  </div>
)

const ItemWithSubitems = ({
  item,
  activeItemLink,
  location,
  onLinkClick,
  uid,
  hideSectionTitle,
  onSectionTitleClick,
  createLink,
  isActive,
  level,
  isExpanded,
}) => {
  const SectionTitleComponent = item.disableAccordions
    ? Title
    : ToggleSectionButton

  return (
    <Fragment>
      {item.link ? (
        <span
          css={{
            alignItems: `flex-end`,
            display: `flex`,
            paddingLeft: level === 0 ? 40 : 0,
            position: `relative`,
            width: `100%`,
          }}
        >
          <span
            css={{
              borderRight: `1px solid ${colors.ui.border}`,
              flexGrow: 1,
            }}
          >
            {createLink({
              isActive: item.link === activeItemLink.link,
              isExpanded: isExpanded,
              item,
              location,
              onLinkClick,
            })}
          </span>
          <span css={{ marginLeft: `auto` }}>
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
          title={item.title}
          isActive={isActive}
          uid={uid}
          level={level}
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
      collapsed: props.collapsed || props.isActive || false,
    }
    this.handleClick = this.handleClick.bind(this)
  }

  handleClick(...args) {
    this.setState({ collapsed: !this.state.collapsed })
    if (this.props.onClick) {
      this.props.onClick(...args)
    }
  }

  render() {
    const {
      collapsed = this.state.collapsed,
      createLink,
      location,
      onLinkClick,
      onSectionTitleClick,
      item,
      hideSectionTitle,
      activeItemLink,
      isFirstItem,
      isLastItem,
      singleSection,
      level,
      activeItemParents,
      isActive,
    } = this.props
    const uid = `section_` + this.state.uid

    return (
      <li
        className="accordion"
        css={{
          background:
            collapsed && isActive && level > 0 ? colors.ui.light : false,
          position: `relative`,
        }}
      >
        <ItemWithSubitems
          item={item}
          activeItemLink={activeItemLink}
          location={location}
          onLinkClick={onLinkClick}
          uid={uid}
          hideSectionTitle={hideSectionTitle}
          onSectionTitleClick={this.handleClick}
          createLink={createLink}
          isActive={collapsed}
          isExpanded={isActive}
          level={level}
          activeItemParents={activeItemParents}
        />
        <ul
          id={uid}
          css={{
            ...styles.ul,
            paddingBottom: level === 0 && collapsed ? 40 : false,
            "& li": {
              paddingLeft: paddingLeft(level),
            },
            [presets.Tablet]: {
              display: collapsed ? `block` : `none`,
            },
          }}
        >
          {item.items.map(subitem => (
            <Item
              createLink={createLink}
              location={location}
              onLinkClick={onLinkClick}
              onSectionTitleClick={onSectionTitleClick}
              item={subitem}
              hideSectionTitle={hideSectionTitle}
              singleSection={singleSection}
              activeItemLink={activeItemLink}
              isFirstItem={isFirstItem}
              isLastItem={isLastItem}
              activeItemParents={activeItemParents}
              isActive={isActive}
              key={subitem.title}
              level={level + 1}
              styles={{
                ...(item.ui === `steps` && {
                  ...styles.ulStepsUI,
                }),
              }}
              ui={item.ui}
            />
          ))}
        </ul>
      </li>
    )
  }
}

export default Accordion

const styles = {
  ul: {
    listStyle: `none`,
    margin: 0,
    position: `relative`,
    "& li": {
      marginBottom: 0,
    },
  },
  ulStepsUI: {
    "&:after": {
      background: colors.ui.bright,
      content: ` `,
      left: 0,
      top: `1.5rem`,
      bottom: `1.5rem`,
      position: `absolute`,
      width: 1,
    },
    "&:before": {
      content: ` `,
      height: `100%`,
      left: 0,
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
    marginLeft: `auto`,
  },
  button: {
    backgroundColor: `transparent`,
    border: 0,
    cursor: `pointer`,
    padding: 0,
    position: `relative`,
    textAlign: `left`,
    width: `100%`,
  },
  liActive: {
    background: colors.ui.light,
  },
  ulHorizontalDivider: {
    background: colors.ui.border,
    top: 0,
    content: ` `,
    height: 1,
    position: `absolute`,
    right: 0,
    left: 40,
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
