import React from "react"
import ReactSwitch from "react-switch"

export const Switch = props => <ReactSwitch {...props} />

Switch.defaultProps = {
  checkedIcon: false,
  uncheckedIcon: false,
  height: 24,
  width: 48,
  handleDiameter: 24,
  offColor: `#000`,
  onColor: `#000`,
  boxShadow: `inset 0 0 0 1px #000`,
}

export default Switch
