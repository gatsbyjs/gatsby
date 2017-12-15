import React from "react"
import { css } from "glamor"

const blue = {
  primary: `#A0CED9`,
  hover: `#92BCC6`,
}

const orange = {
  primary: `#EAB69B`,
  hover: `#E8AF91`,
}

const green = {
  primary: `#ADF7B6`,
  hover: `#9EE1A6`,
}

const styles = css({
  backgroundColor: blue.primary,
  color: `rgba(36, 47, 60, 0.66)`,
  display: `inline-block`,
  fontSize: `18px`,
  padding: `16px 24px`,
  minWidth: `278px`,
  borderRadius: `3px`,
  border: 0,
  cursor: `pointer`,
  "&:hover": {
    backgroundColor: blue.hover,
  },
})

const Button = props => <button className={styles} {...props} />

export default Button
