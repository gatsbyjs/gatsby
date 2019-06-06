import React, { useState, useEffect } from "react"
import { css } from "theme-ui"

/*
 * Custom toggle switch component
 *
 * - current implementation uses: https://github.com/aaronshaf/react-toggle
 * - alternative: https://github.com/markusenglund/react-switch#readme
 *
 * Questions:
 * - Does this need to handle touch events
 * - Is aria-label okay to use here or should this use aria-labelledby?
 * - Is `role="switch"` appropriate here?
 */

const IconSpan = props => (
  <span
    {...props}
    css={css({
      width: `50%`,
      height: `100%`,
      display: `flex`,
      alignItems: `center`,
      justifyContent: `center`,
    })}
  />
)

export const Thumb = props => (
  <div
    {...props}
    css={css({
      width: 24,
      height: 24,
      borderRadius: 99999,
      bg: `white`,
      border: `1px solid`,
    })}
  />
)

export const Switch = ({
  checked,
  label,
  icons,
  thumb,
  className,
  ...props
}) => (
  <button
    {...props}
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    className={[className, checked ? `active` : ``].join(` `)}
    css={css({
      boxSizing: `border-box`,
      appearance: `none`,
      color: `inherit`,
      bg: `primary`,
      p: 0,
      m: 0,
      display: `inline-flex`,
      alignItems: `center`,
      width: 48,
      height: 24,
      fontFamily: `inherit`,
      fontSize: `inherit`,
      borderRadius: 99999,
      border: 0,
      position: `relative`,
      ":focus": {
        outline: `none`,
        div: {
          boxShadow: `0 0 4px 1px`,
        },
      },
    })}
  >
    {icons && <IconSpan>{icons.checked}</IconSpan>}
    {icons && <IconSpan>{icons.unchecked}</IconSpan>}
    {React.cloneElement(thumb, {
      style: {
        position: `absolute`,
        top: -1,
        left: -1,
        transitionProperty: `transform`,
        transitionDuration: `0.1s`,
        transitionTimingFunction: `ease-out`,
        transform: checked ? `translateX(100%)` : `translateX(0)`,
      },
    })}
  </button>
)

Switch.defaultProps = {
  label: `Toggle`,
  icons: false,
  thumb: <Thumb />,
}

export default Switch
