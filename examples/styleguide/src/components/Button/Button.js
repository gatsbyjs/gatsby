import React from "react"
import PropTypes from "prop-types"
import { css } from "glamor"

const blue = `blue`
const orange = `orange`
const green = `green`

const colors = {
  [blue]: {
    primary: `#A0CED9`,
    hover: `#92BCC6`,
  },
  [orange]: {
    primary: `#EAB69B`,
    hover: `#E8AF91`,
  },
  [green]: {
    primary: `#ADF7B6`,
    hover: `#9EE1A6`,
  },
}

const sm = `sm`
const md = `md`
const lg = `lg`

const sizes = {
  [sm]: {
    fontSize: `14px`,
    padding: `12px 20px`,
    minWidth: `160px`,
  },
  [md]: {
    fontSize: `18px`,
    padding: `16px 24px`,
    minWidth: `200px`,
  },
  [lg]: {
    fontSize: `22px`,
    padding: `20px 28px`,
    minWidth: `260px`,
  },
}

const styles = ({ backgroundColor, size }) => {
  const backgroundColorConfig =
    colors[backgroundColor] || colors[Button.defaultProps.backgroundColor]
  const sizeConfig = sizes[size] || sizes[Button.defaultProps.size]
  return css({
    backgroundColor: backgroundColorConfig.primary,
    ...sizeConfig,
    color: `rgba(36, 47, 60, 0.66)`,
    display: `inline-block`,
    borderRadius: `3px`,
    border: 0,
    cursor: `pointer`,
    "&:hover": {
      backgroundColor: backgroundColorConfig.hover,
    },
  })
}

/**
 * The `<Button>` is a foundational trigger component for capturing
 * and guiding user-interaction.
 */
const Button = ({ backgroundColor, size, ...rest }) => (
  <button className={styles({ backgroundColor, size })} {...rest} />
)

Button.propTypes = {
  /** The color to use as the background */
  backgroundColor: PropTypes.oneOf(Object.keys(colors)),
  /** The size of the button */
  size: PropTypes.oneOf(Object.keys(sizes)),
}

Button.defaultProps = {
  backgroundColor: blue,
  size: md,
}

export default Button
