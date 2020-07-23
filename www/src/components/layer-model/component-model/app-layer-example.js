/** @jsx jsx */
import { jsx } from "theme-ui"

export default function AppLayerExample() {
  return (
    <div
      sx={{
        border: 1,
        borderColor: `ui.border`,
        borderRadius: 2,
        display: `flex`,
        flexDirection: `column`,
        height: `100%`,
        background: `ui.background`,
      }}
    >
      <div sx={{ p: 3, borderBottom: 1, borderColor: `ui.border` }}>Home</div>
      <div sx={{ p: 3, height: `100%`, background: `ui.background` }}>
        Gatsby tips
      </div>
    </div>
  )
}
