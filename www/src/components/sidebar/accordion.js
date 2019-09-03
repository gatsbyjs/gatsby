import React, { Fragment } from "react"

import Item from "./item"
import { Title, TitleButton, SplitButton } from "./section-title"
import { colors, space, transition } from "../../utils/presets"
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
  disableAccordions,
}) => {
  const SectionTitleComponent = disableAccordions ? Title : TitleButton
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
      disableAccordions,
    } = this.props
    const uid = `item_` + this.state.uid
    const isExpanded = openSectionHash[item.title] || disableAccordions

    return (
      <li
        css={{
          background:
            (isParentOfActiveItem && item.level === 0) ||
            (isActive && item.level === 0)
              ? presets.activeSectionBackground
              : false,
          position: `relative`,
          transition: `all ${transition.speed.fast} ${transition.curve.default}`,
          marginTop:
            item.level === 0 && disableAccordions && !isSingle
              ? `${space[4]} !important`
              : false,
          ...(item.level === 0 &&
            !isSingle && {
              "::before": {
                content: `" "`,
                position: `absolute`,
                borderTop:
                  !isExpanded && !isSingle && !isActive
                    ? `1px solid ${colors.ui.border.subtle}`
                    : `1px solid ${colors.purple[10]}`,
                left:
                  (isParentOfActiveItem && isExpanded) ||
                  (isActive && isExpanded)
                    ? 0
                    : space[6],
                right: 0,
                top: 0,
              },
              ":after": {
                top: `auto`,
                bottom: -1,
              },
            }),
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
          disableAccordions={disableAccordions}
        />
        <ul
          id={uid}
          css={{
            listStyle: `none`,
            margin: 0,
            position: `relative`,
            display: isExpanded ? `block` : `none`,
            ...(item.ui === `steps` && {
              "&:after": {
                background: colors.ui.border.subtle,
                bottom: 0,
                content: `''`,
                left: 27,
                position: `absolute`,
                top: 0,
                width: 1,
              },
            }),
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
              ui={item.ui}
            />
          ))}
        </ul>
      </li>
    )
  }
}

export default Accordion
