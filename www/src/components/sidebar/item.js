import React, { Fragment } from "react"

import Accordion from "./accordion"
import ItemLink from "./item-link"
import { useSidebarContext } from "./sidebar"

const Item = ({ item, ui }) => {
  const { getItemState } = useSidebarContext()
  const { isActive } = getItemState(item)
  const itemRef = React.useRef(null)

  React.useEffect(() => {
    if (isActive) {
      itemRef.current.scrollIntoView({ block: `center` })
    }
  }, [isActive])

  return (
    <Fragment>
      {item.items ? (
        <Accordion itemRef={itemRef} item={item} />
      ) : (
        <li ref={itemRef}>
          <ItemLink item={item} ui={ui} />
        </li>
      )}
    </Fragment>
  )
}

export default Item
