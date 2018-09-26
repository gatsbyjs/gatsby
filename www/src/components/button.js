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
  large,
  small,
  secondary,
  ...rest
}) => {
  const Tag = components[tag || `link`]

  const props = {
    to: !tag ? to : undefined,
    href: tag === `href` ? to : undefined,
    css: {
      "&&": {
        ...buttonStyles.default,
        ...overrideCSS,
        ...(secondary && { ...buttonStyles.secondary }),
        ...(large && { ...buttonStyles.large }),
        ...(small && { ...buttonStyles.small }),
      },
    },
    ...rest,
  }

  return (
    <Tag {...props}>
      {children}
      {icon && <>{icon}</>}
    </Tag>
  )
}

export default Button
