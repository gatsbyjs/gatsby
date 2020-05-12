/** @jsx jsx */
import { jsx } from "theme-ui"

import { useSidebarContext } from "./sidebar"
import Item from "./item"
import SectionTitle from "./section-title"

export default function Accordion({ itemRef, item }) {
  const { getItemState, disableAccordions } = useSidebarContext()
  const { inActiveTree, isExpanded } = getItemState(item)

  // TODO use the useUniqueId hook when React releases it
  // https://github.com/facebook/react/pull/17322
  // Use the title as the ID since it's already being used as the hash key
  const uid = `item_${item.title.replace(/[^-a-zA-Z0-9]+/g, `_`)}`

  return (
    <li
      sx={{
        bg:
          item.level === 0 && inActiveTree && `sidebar.activeSectionBackground`,
        position: `relative`,
        transition: t =>
          `all ${t.transition.speed.fast} ${t.transition.curve.default}`,
        mt: t =>
          item.level === 0 && disableAccordions && `${t.space[4]} !important`,
        ...(item.level === 0 && {
          "::before": {
            content: `" "`,
            position: `absolute`,
            borderTopWidth: `1px`,
            borderTopStyle: `solid`,
            borderColor: `ui.border`,
            left: isExpanded && inActiveTree ? 0 : 6,
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
      <SectionTitle itemRef={itemRef} item={item} uid={uid} />
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
            <Item item={subitem} key={subitem.title} />
          ))}
        </ul>
      )}
    </li>
  )
}
