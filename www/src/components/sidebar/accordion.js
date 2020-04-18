/** @jsx jsx */
import { jsx } from "theme-ui"
import React from "react"

import Item from "./item"
import { Title, TitleButton, SplitButton } from "./section-title"

const ItemWithSubitems = ({
  itemRef,
  isExpanded,
  isActive,
  isParentOfActiveItem,
  item,
  onLinkClick,
  onSectionTitleClick,
  uid,
  disableAccordions,
}) => {
  const SectionTitleComponent = disableAccordions ? Title : TitleButton

  return item.link ? (
    <SplitButton
      itemRef={itemRef}
      isActive={isActive}
      isExpanded={isExpanded}
      isParentOfActiveItem={isParentOfActiveItem}
      item={item}
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
  )
}

export default function Accordion({
  itemRef,
  activeItemLink,
  activeItemParents,
  item,
  onLinkClick,
  onSectionTitleClick,
  openSectionHash,
  disableAccordions,
}) {
  // TODO use the useUniqueId hook when React releases it
  // https://github.com/facebook/react/pull/17322
  // Use the title as the ID since it's already being used as the hash key
  const uid = `item${item.title.replace(/[^-a-zA-Z0-9]/g, `_`)}`

  const isActive = item.link === activeItemLink.link
  const isParentOfActiveItem = activeItemParents.some(
    parent => parent === item.title
  )

  const isActiveOrParent = isActive || isParentOfActiveItem
  const isExpanded = openSectionHash[item.title] || disableAccordions

  return (
    <li
      sx={{
        bg:
          item.level === 0 && isActiveOrParent
            ? `sidebar.activeSectionBackground`
            : false,
        position: `relative`,
        transition: t =>
          `all ${t.transition.speed.fast} ${t.transition.curve.default}`,
        mt: t =>
          item.level === 0 && disableAccordions
            ? `${t.space[4]} !important`
            : false,
        ...(item.level === 0 && {
          "::before": {
            content: `" "`,
            position: `absolute`,
            borderTopWidth: `1px`,
            borderTopStyle: `solid`,
            borderColor: `ui.border`,
            left: t => (isExpanded && isActiveOrParent ? 0 : t.space[6]),
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
        itemRef={itemRef}
        isActive={isActive}
        isExpanded={isExpanded}
        isParentOfActiveItem={isParentOfActiveItem}
        item={item}
        onLinkClick={onLinkClick}
        onSectionTitleClick={onSectionTitleClick}
        uid={uid}
        disableAccordions={disableAccordions}
      />
      {isExpanded && (
        <ul
          id={uid}
          sx={{
            listStyle: `none`,
            margin: 0,
            position: `relative`,
            ...(item.ui === `steps` && {
              "&:after": {
                backgroundColor: `ui.border`,
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
              item={subitem}
              key={subitem.title}
              onLinkClick={onLinkClick}
              isExpanded={isExpanded}
              onSectionTitleClick={onSectionTitleClick}
              openSectionHash={openSectionHash}
              ui={item.ui}
            />
          ))}
        </ul>
      )}
    </li>
  )
}
