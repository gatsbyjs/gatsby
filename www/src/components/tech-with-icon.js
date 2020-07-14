/** @jsx jsx */
import { jsx } from "theme-ui"

export default function TechWithIcon({ icon, height = `1.2em`, children }) {
  return (
    <span sx={{ whiteSpace: `nowrap` }}>
      {children}
      &nbsp;
      <img
        src={icon}
        alt=""
        sx={{
          verticalAlign: `text-bottom`,
          height: `${height}`,
          m: 0,
        }}
      />
    </span>
  )
}
