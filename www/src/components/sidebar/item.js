import React from "react"

import Accordion from "./accordion"
import ItemLink from "./item-link"
import { useSidebarContext } from "./sidebar"

const Item = ({ item, isSteps }) => {
  const { getItemState } = useSidebarContext()
  const { isActive } = getItemState(item)
  const itemRef = React.useRef(null)

  React.useEffect(() => {
    // If the active item isn't a hash, scroll to it on page load
    if (isActive && !item.link.includes(`#`)) {
      itemRef.current.scrollIntoView({ block: `center` })
    }
  }, [isActive, item])

  if (item.items) {
    return <Accordion itemRef={itemRef} item={item} />
  } else {
    return (
      <li ref={itemRef}>
        <ItemLink item={item} isSteps={isSteps} />
      </li>
    )
  }
}

export default Item
