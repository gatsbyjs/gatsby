import React, { Fragment, useCallback } from "react"

import Accordion from "./accordion"
import ItemLink from "./item-link"

const Item = ({
  activeItemLink,
  activeItemParents,
  openSectionHash,
  item,
  onLinkClick,
  onSectionTitleClick,
  ui,
  disableAccordions,
}) => {
  const isActive = item.link === activeItemLink.link
  const itemRef = React.useRef(null)

  React.useEffect(() => {
    if (isActive) {
      itemRef.current.scrollIntoView({ block: `center` })
    }
  }, [isActive])

  return (
    <Fragment>
      {item.items ? (
        <Accordion
          itemRef={itemRef}
          activeItemLink={activeItemLink}
          activeItemParents={activeItemParents}
          item={item}
          onLinkClick={onLinkClick}
          openSectionHash={openSectionHash}
          onSectionTitleClick={onSectionTitleClick}
          disableAccordions={disableAccordions}
        />
      ) : (
        <li ref={itemRef}>
          <ItemLink
            isActive={isActive}
            item={item}
            onLinkClick={onLinkClick}
            ui={ui}
          />
        </li>
      )}
    </Fragment>
  )
}

export default Item
