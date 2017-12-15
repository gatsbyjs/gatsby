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

const styles = ({ backgroundColor } = {}) =>
  css({
    backgroundColor: colors[backgroundColor].primary,
    color: `rgba(36, 47, 60, 0.66)`,
    display: `inline-block`,
    fontSize: `18px`,
    padding: `16px 24px`,
    minWidth: `278px`,
    borderRadius: `3px`,
    border: 0,
    cursor: `pointer`,
    "&:hover": {
      backgroundColor: colors[backgroundColor].hover,
    },
  })

const Button = ({ backgroundColor, ...rest }) => (
  <button className={styles({ backgroundColor })} {...rest} />
)

Button.propTypes = {
  /** The color to use as the background */
  backgroundColor: PropTypes.oneOf(Object.keys(colors)),
}

Button.defaultProps = {
  backgroundColor: blue,
}

export default Button
