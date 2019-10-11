import { colors } from "../gatsby-plugin-theme-ui"

export const focusStyle = {
  outline: 0,
  boxShadow: `0 0 0 2px ${colors.input.focusBoxShadow}`,
}

export const visuallyHidden = {
  // include `px` so we can use it with `sx`
  border: 0,
  clip: `rect(0, 0, 0, 0)`,
  height: `1px`,
  margin: `-1px`,
  overflow: `hidden`,
  padding: 0,
  position: `absolute`,
  whiteSpace: `nowrap`,
  width: `1px`,
}
