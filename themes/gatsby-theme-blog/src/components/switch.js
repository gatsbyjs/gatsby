import React from "react"
import ReactSwitch from 'react-switch'
import { css } from "theme-ui"

export const Switch = props =>
  <ReactSwitch
    {...props}
    css={css({
      bg: 'primary',
    })}
  />

Switch.defaultProps = {
  checkedIcon: false,
  uncheckedIcon: false,
  height: 24,
  width: 48,
  handleDiameter: 24,
  offColor: false,
  onColor: false,
}

export default Switch
