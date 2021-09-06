/** @jsx createElement */
import { createElement, useCallback } from "react"
import PropTypes from "prop-types"
import { Link, useLocation } from "@gatsbyjs/reach-router"
// import { loader, navigate } from "gatsby/router"

declare global {
  interface Window {
    ___loader: { prefetch: Function }
    ___navigate: Function
  }
}

type ILinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  onClick?: (e: React.MouseEvent) => void
  onMouseEnter?: (e: React.MouseEvent) => void
  to: string
  replace?: boolean
  state?: unknown
  className?: string
  activeClassName?: string
  style?: React.CSSProperties
  activeStyle?: React.CSSProperties
  partiallyActive?: boolean
  href: never
}

export const GatsbyLink: React.FC<ILinkProps> = function GatsbyLink({
  to,
  partiallyActive,
  className,
  activeClassName,
  style,
  activeStyle,
  onMouseEnter,
  onClick,
  state,
  replace,
  target,
  ...props
}) {
  const loader = window.___loader
  const navigate = window.___navigate
  const location = useLocation()

  const applyActiveStyleOrClass = useCallback(
    function applyActiveStyleOrClass({ isCurrent, isPartiallyCurrent }) {
      if (partiallyActive ? isPartiallyCurrent : isCurrent) {
        return {
          className: `${className}${
            className && activeClassName ? ` ` : ``
          }${activeClassName}`,
          style: { ...style, ...activeStyle },
        }
      }

      return null
    },
    [className, activeClassName, style, activeStyle]
  )
  const onMouseEnterCallback = useCallback(
    function onMouseEnterCallback(e) {
      if (onMouseEnter) {
        onMouseEnter(e)
      }

      const parsedUrl = new URL(to, location.origin)
      loader.prefetch(parsedUrl.pathname, {
        priority: true,
      })
    },
    [to]
  )

  const onClickCallback = useCallback(
    function onClickCallback(e) {
      if (onClick) {
        onClick(e)
      }

      if (
        e.button === 0 && // ignore right clicks
        !target && // let browser handle "target=_blank"
        !e.defaultPrevented && // onClick prevented default
        !e.metaKey && // ignore clicks with modifier keys...
        !e.altKey &&
        !e.ctrlKey &&
        !e.shiftKey
      ) {
        e.preventDefault()

        // Make sure the necessary scripts and data are
        // loaded before continuing.
        const parsedUrl = new URL(to, location.origin)
        navigate(parsedUrl.pathname, {
          state,
          replace: !!replace,
        })
      }

      return true
    },
    [to, state, replace]
  )

  return (
    <Link
      to={to}
      getProps={applyActiveStyleOrClass}
      onClick={onClickCallback}
      onMouseEnter={onMouseEnterCallback}
      state={state}
      replace={replace}
      target={target}
      {...props}
    />
  )
}

GatsbyLink.propTypes = {
  onClick: PropTypes.func,
  to: PropTypes.string.isRequired,
  replace: PropTypes.bool,
  state: PropTypes.object,
  activeClassName: PropTypes.string,
  activeStyle: PropTypes.object,
  partiallyActive: PropTypes.bool,
}
