import React, { Fragment } from "react"

import Item from "./item"
import { Title, TitleButton, SplitButton } from "./section-title"
import { colors, space } from "../../utils/presets"
import presets from "../../utils/sidebar/presets"

const ItemWithSubitems = ({
  activeItemLink,
  createLink,
  isExpanded,
  isParentOfActiveItem,
  item,
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
          createLink={createLink}
          isActive={isActive}
          isExpanded={isExpanded}
          isParentOfActiveItem={isParentOfActiveItem}
          item={item}
          location={location}
          onLinkClick={onLinkClick}
          onSectionTitleClick={onSectionTitleClick}
          uid={uid}
        />
      ) : (
        <SectionTitleComponent
          isActive={isActive}
          isExpanded={isExpanded}
          isParentOfActiveItem={isParentOfActiveItem}
          item={item}
          onSectionTitleClick={onSectionTitleClick}
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
    }

    this.handleClick = this.handleClick.bind(this)
  }

  handleClick(...args) {
    if (this.props.onLinkClick) {
      this.props.onLinkClick(...args)
    }

    if (this.props.onSectionTitleClick) {
      this.props.onSectionTitleClick(...args)
    }
  }

  render() {
    const {
      activeItemLink,
      activeItemParents,
      createLink,
      isActive,
      isParentOfActiveItem,
      item,
      location,
      onLinkClick,
      onSectionTitleClick,
      openSectionHash,
      isSingle,
    } = this.props
    const uid = `item_` + this.state.uid
    const isExpanded = openSectionHash[item.title] || item.disableAccordions

    return (
      <li
        css={{
          background:
            isExpanded && isActive && item.level > 0
              ? presets.activeSectionBackground
              : false,
          position: `relative`,
          // marginTop:
          //   level === 0 && isExpanded ? `${space[4]} !important` : false,
        }}
      >
        <ItemWithSubitems
          activeItemLink={activeItemLink}
          activeItemParents={activeItemParents}
          createLink={createLink}
          isActive={isActive}
          isExpanded={isExpanded}
          isParentOfActiveItem={isParentOfActiveItem}
          item={item}
          location={location}
          onLinkClick={onLinkClick}
          onSectionTitleClick={onSectionTitleClick}
          uid={uid}
        />
        <ul
          id={uid}
          css={{
            ...styles.ul,
            display: isExpanded ? `block` : `none`,
            paddingBottom:
              item.level === 0 && isExpanded && !isSingle ? space[6] : false,
            borderBottom:
              item.level === 0 && isExpanded && !isSingle
                ? `1px solid ${colors.gray.border}`
                : false,
            marginBottom:
              item.level === 0 && isExpanded && !isSingle
                ? `${space[6]} !important`
                : false,
          }}
        >
          {item.items.map(subitem => (
            <Item
              activeItemLink={activeItemLink}
              activeItemParents={activeItemParents}
              createLink={createLink}
              item={subitem}
              key={subitem.title}
              location={location}
              onLinkClick={onLinkClick}
              isExpanded={isExpanded}
              onSectionTitleClick={onSectionTitleClick}
              openSectionHash={openSectionHash}
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
  },
  ulStepsUI: {
    "&:after": {
      background: colors.ui.bright,
      bottom: 0,
      content: `''`,
      left: 27,
      position: `absolute`,
      top: 0,
      width: 1,
    },
  },
}
