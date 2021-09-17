/** @jsx jsx */
import { jsx } from "theme-ui"

export default function AppLayerExample() {
  return (
    <div
      sx={{
        border: 1,
        borderColor: `standardLine`,
        borderRadius: 2,
        display: `flex`,
        flexDirection: `column`,
        height: `100%`,
        background: `secondaryBackground`,
      }}
    >
      <div sx={{ p: 4, borderBottom: 1, borderColor: `standardLine` }}>
        Home
      </div>
      <div sx={{ p: 4, height: `100%`, background: `secondaryBackground` }}>
        Gatsby tips
      </div>
    </div>
  )
}
