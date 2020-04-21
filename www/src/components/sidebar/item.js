import React from "react"

import Accordion from "./accordion"
import ItemLink from "./item-link"
import { useSidebarContext } from "./sidebar"

const Item = ({ item }) => {
  const { getItemState } = useSidebarContext()
  const { isActive } = getItemState(item)
  const itemRef = React.useRef(null)

  // Scroll the active item into view on
  React.useEffect(() => {
    // FIXME don't do this if this item is a hash
    if (isActive) {
      itemRef.current.scrollIntoView({ block: `center` })
    }
  }, [isActive])

  if (item.items) {
    return <Accordion itemRef={itemRef} item={item} />
  } else {
    return (
      <li ref={itemRef}>
        <ItemLink item={item} />
      </li>
    )
  }
}

export default Item
