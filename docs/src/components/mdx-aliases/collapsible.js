/** @jsx jsx */
import { jsx } from "theme-ui"

const Collapsible = ({summary, children}) => {
  return (
    <details
      sx={{
        backgroundColor: t => t.colors.purple[10],
        padding: t => t.space[5],
        marginBottom: t => t.space[7],
        ">:last-child": {
          marginBottom: t => t.space[0],
        },
        ">:nth-child(2)": {
          marginTop: t => t.space[3],
        }
      }}
    >
      <summary
        sx={{
          display: "list-item",
          ">:first-child": {
            display: "inline",
          },
        }}
      >
        {summary}
      </summary>
      {children}
    </details>
  )
}

export default Collapsible
