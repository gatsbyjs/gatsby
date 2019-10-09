/** @jsx jsx */
import { jsx } from "theme-ui"
import React from "react"
import { Link } from "gatsby"

import { buttonStyles } from "../utils/styles"

const components = {
  link: Link,
  href: ({ children, ...rest }) => <a {...rest}>{children}</a>,
  button: ({ children, ...rest }) => <button {...rest}>{children}</button>,
}

const Button = ({
  to,
  overrideCSS,
  icon,
  children,
  tag,
  secondary,
  tracking,
  variant,
  ...rest
}) => {
  const Tag = components[tag || `link`]

  const props = {
    to: !tag ? to : undefined,
    href: tag === `href` ? to : undefined,
    ...rest,
  }

  const trackingOnClick = e => {
    if (typeof props.onClick === `function`) {
      props.onClick(e)
    }

    let redirect = true

    // Slightly modified logic from the gatsby-plugin-google-analytics
    // But this one should work with `Link` component as well
    if (
      e.button !== 0 ||
      e.altKey ||
      e.ctrlKey ||
      e.metaKey ||
      e.shiftKey ||
      e.defaultPrevented
    ) {
      redirect = false
    }

    if (props.target && props.target.toLowerCase() !== `_self`) {
      redirect = false
    }

    if (tracking && window.ga) {
      window.ga(`send`, `event`, {
        eventCategory: `Outbound Link`,
        eventAction: `click`,
        eventLabel: `${tracking} - ${props.to || props.href}`,
        transport: redirect ? `beacon` : ``,
      })
    }
  }

  return (
    <Tag
      {...props}
      onClick={trackingOnClick}
      sx={{
        "&&": {
          ...buttonStyles().default,
          ...(secondary && buttonStyles().secondary),
          variant: `buttons.${variant}`,
          ...overrideCSS,
        },
      }}
    >
      {children}
      {icon && <React.Fragment>{icon}</React.Fragment>}
    </Tag>
  )
}

export default Button
