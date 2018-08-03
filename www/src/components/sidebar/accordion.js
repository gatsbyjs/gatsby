import React, { Fragment } from "react"

import Item from "./item"
import { Title, TitleButton, SplitButton } from "./section-title"
import presets, { colors } from "../../utils/presets"

const paddingLeft = level => (level === 0 ? level + 1 * 40 : level + 1 * 20)

const ItemWithSubitems = ({
  activeItemLink,
  createLink,
  isExpanded,
  item,
  level,
  location,
  onLinkClick,
  onSectionTitleClick,
  uid,
}) => {
  const SectionTitleComponent = item.disableAccordions ? Title : TitleButton
  const isActive = item.link === activeItemLink.link

  return (
    <Fragment>
      {item.link ? (
        <SplitButton
          level={level}
          isActive={isActive}
          isExpanded={isExpanded}
          item={item}
          location={location}
          onLinkClick={onLinkClick}
          onSectionTitleClick={onSectionTitleClick}
          uid={uid}
          createLink={createLink}
        />
      ) : (
        <SectionTitleComponent
          isActive={isActive}
          isExpanded={isExpanded}
          level={level}
          onSectionTitleClick={onSectionTitleClick}
          title={item.title}
          uid={uid}
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
      isExpanded: props.isExpanded || props.isActive || false,
    }

    this.handleClick = this.handleClick.bind(this)
  }

  handleClick(...args) {
    this.setState({ isExpanded: !this.state.isExpanded })

    if (this.props.onLinkClick) {
      this.props.onLinkClick(...args)
    }
  }

  render() {
    const {
      activeItemLink,
      activeItemParents,
      createLink,
      isActive,
      isExpanded = this.state.isExpanded,
      item,
      level,
      location,
      onLinkClick,
      onSectionTitleClick,
    } = this.props
    const uid = `item_` + this.state.uid

    return (
      <li
        css={{
          background:
            isExpanded && isActive && level > 0 ? colors.ui.light : false,
          position: `relative`,
        }}
      >
        <ItemWithSubitems
          activeItemLink={activeItemLink}
          activeItemParents={activeItemParents}
          createLink={createLink}
          isActive={isActive}
          isExpanded={isExpanded}
          item={item}
          level={level}
          location={location}
          onLinkClick={onLinkClick}
          onSectionTitleClick={this.handleClick}
          uid={uid}
        />
        <ul
          id={uid}
          css={{
            ...styles.ul,
            paddingBottom: level === 0 && isExpanded ? 40 : false,
            "& li": {
              paddingLeft: paddingLeft(level),
            },
            [presets.Tablet]: {
              display: isExpanded ? `block` : `none`,
            },
          }}
        >
          {item.items.map(subitem => (
            <Item
              activeItemLink={activeItemLink}
              activeItemParents={activeItemParents}
              createLink={createLink}
              item={subitem}
              key={subitem.title}
              level={level + 1}
              location={location}
              onLinkClick={onLinkClick}
              onSectionTitleClick={onSectionTitleClick}
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
      bottom: `1.5rem`,
      content: ` `,
      left: 0,
      position: `absolute`,
      top: `1.5rem`,
      width: 1,
    },
    "&:before": {
      borderLeft: `1px dashed ${colors.ui.bright}`,
      bottom: 0,
      content: ` `,
      height: `100%`,
      left: 0,
      position: `absolute`,
      width: 0,
    },
  },
}
