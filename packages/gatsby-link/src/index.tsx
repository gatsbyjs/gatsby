import PropTypes from "prop-types"
import React from "react"
import { Link, LinkProps, LinkGetProps, NavigateFn, NavigateOptions } from "@reach/router"

import { parsePath } from "./parse-path"

export { parsePath }

export interface IGatsbyLinkState {
  IOSupported: boolean
}

export interface IGatsbyLinkProps<TState>
  extends React.PropsWithoutRef<LinkProps<TState>> {
  /** A class to apply when this Link is active */
  activeClassName?: string

  /** Inline styles for when this Link is active */
  activeStyle?: {}

  /** Class the link as highlighted if there is a partial match via a the `to` being prefixed to the current url */
  partiallyActive?: boolean

  /** The URL you want to link to */
  to: string
}

interface IOResult {
  instance: IntersectionObserver
  el: Element
}

/**
 * It is common to host sites in a sub-directory of a site. Gatsby lets you set the path prefix for your site.
 * After doing so, Gatsby's `<Link>` component will automatically handle constructing the correct URL in
 * development and production
 */
export function withPrefix(path: string|number): string {
  return normalizePath(
    [
      typeof __BASE_PATH__ !== `undefined` ? __BASE_PATH__ : __PATH_PREFIX__,
      path,
    ].join(`/`)
  )
}

export function withAssetPrefix(path: string): string {
  return [__PATH_PREFIX__].concat([path.replace(/^\//, ``)]).join(`/`)
}

function normalizePath(path: string): string {
  return path.replace(/\/+/g, `/`)
}

const NavLinkPropTypes = {
  activeClassName: PropTypes.string,
  activeStyle: PropTypes.object,
  partiallyActive: PropTypes.bool,
}

// Set up IntersectionObserver
const createIntersectionObserver = (el: Element, cb: () => void): IOResult => {
  const io = new window.IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (el === entry.target) {
        // Check if element is within viewport, remove listener, destroy observer, and run link callback.
        // MSEdge doesn't currently support isIntersecting, so also test for  an intersectionRatio > 0
        if (entry.isIntersecting || entry.intersectionRatio > 0) {
          io.unobserve(el)
          io.disconnect()
          cb()
        }
      }
    })
  })
  // Add element to the observer
  io.observe(el)
  return { instance: io, el }
}

function refIsObject<T>(
  ref: React.Ref<T> | null | undefined
): ref is React.RefObject<T> {
  return !!(ref && ref.hasOwnProperty(`current`))
}

// Hack to get React.RefObject<T> to accept our assignments. Unfortunately, React declares RefObject as readonly.
function asMutable<T>(ref: React.RefObject<T>): { current: T | null } {
  return ref
}

class GatsbyLinkInternal<TState> extends React.Component<
  IGatsbyLinkProps<TState>,
  IGatsbyLinkState
> {
  io?: IOResult

  propTypes: React.WeakValidationMap<IGatsbyLinkProps<TState>> = {
    ...NavLinkPropTypes,
    onClick: PropTypes.func,
    to: PropTypes.string.isRequired,
    replace: PropTypes.bool,
    // eslint-disable-next-line no-any
    state: PropTypes.object as any,
  }

  constructor(props: IGatsbyLinkProps<TState>) {
    super(props)
    // Default to no support for IntersectionObserver
    let IOSupported = false
    if (typeof window !== `undefined` && window.IntersectionObserver) {
      IOSupported = true
    }

    this.state = {
      IOSupported,
    }
  }

  componentDidUpdate(prevProps: IGatsbyLinkProps<TState>) {
    // Preserve non IO functionality if no support
    if (this.props.to !== prevProps.to && !this.state.IOSupported) {
      ___loader.enqueue(parsePath(this.props.to).pathname)
    }
  }

  componentDidMount() {
    // Preserve non IO functionality if no support
    if (!this.state.IOSupported) {
      ___loader.enqueue(parsePath(this.props.to).pathname)
    }
  }

  componentWillUnmount() {
    if (!this.io) {
      return
    }
    const { instance, el } = this.io

    instance.unobserve(el)
    instance.disconnect()
  }

  handleRef: React.Ref<HTMLAnchorElement> = (ref: HTMLAnchorElement) => {
    if (refIsObject(this.props.innerRef)) {
      asMutable(this.props.innerRef).current = ref
    } else if (this.props.innerRef) {
      this.props.innerRef(ref)
    }

    if (this.state.IOSupported && ref) {
      // If IO supported and element reference found, setup Observer functionality
      this.io = createIntersectionObserver(ref, () => {
        ___loader.enqueue(parsePath(this.props.to).pathname)
      })
    }
  }

  defaultGetProps = ({ isPartiallyCurrent, isCurrent }: LinkGetProps): {} => {
    if (this.props.partiallyActive ? isPartiallyCurrent : isCurrent) {
      return {
        className: [this.props.className, this.props.activeClassName]
          .filter(Boolean)
          .join(` `),
        style: { ...this.props.style, ...this.props.activeStyle },
      }
    }

    // TODO: Reach typings state that getProps cannot return null.
    return (null as unknown) as {}
  }

  render() {
    const {
      to,
      getProps = this.defaultGetProps,
      onClick,
      onMouseEnter,
      /* eslint-disable no-unused-vars */
      activeClassName: $activeClassName,
      activeStyle: $activeStyle,
      innerRef: $innerRef,
      partiallyActive,
      state,
      replace,
      /* eslint-enable no-unused-vars */
      ...rest
    } = this.props

    const LOCAL_URL = /^\/(?!\/)/
    if (process.env.NODE_ENV !== `production` && !LOCAL_URL.test(to)) {
      console.warn(
        `External link ${to} was detected in a Link component. Use the Link component only for internal links. See: https://gatsby.dev/internal-links`
      )
    }

    const prefixedTo = withPrefix(to)

    return (
      <Link
        to={prefixedTo}
        state={state}
        getProps={getProps}
        innerRef={this.handleRef as React.Ref<HTMLAnchorElement>}
        onMouseEnter={e => {
          if (onMouseEnter) {
            onMouseEnter(e)
          }
          ___loader.hovering(parsePath(to).pathname)
        }}
        onClick={e => {
          if (onClick) {
            onClick(e)
          }

          if (
            e.button === 0 && // ignore right clicks
            !this.props.target && // let browser handle "target=_blank"
            !e.defaultPrevented && // onClick prevented default
            !e.metaKey && // ignore clicks with modifier keys...
            !e.altKey &&
            !e.ctrlKey &&
            !e.shiftKey
          ) {
            e.preventDefault()

            // Make sure the necessary scripts and data are
            // loaded before continuing.
            navigate(to, { state, replace })
          }

          return true
        }}
        {...rest}
      />
    )
  }
}

const showDeprecationWarning = (
  functionName: string,
  altFunctionName: string,
  version: number
) =>
  console.warn(
    `The "${functionName}" method is now deprecated and will be removed in Gatsby v${version}. Please use "${altFunctionName}" instead.`
  )

/**
 * This component is intended _only_ for links to pages handled by Gatsby. For links to pages on other
 * domains or pages on the same domain not handled by the current Gatsby site, use the normal `<a>` element.
 */
const GatsbyLink = React.forwardRef<
  HTMLAnchorElement,
  IGatsbyLinkProps<unknown>
>((props: IGatsbyLinkProps<unknown>, ref: React.Ref<HTMLAnchorElement>) => (
  <GatsbyLinkInternal innerRef={ref} {...props} />
))
interface GatsbyLink<TState>
  extends React.Component<IGatsbyLinkProps<TState>, IGatsbyLinkState> {}

export default GatsbyLink

/**
 * Sometimes you need to navigate to pages programmatically, such as during form submissions. In these
 * cases, `Link` won’t work.
 */
export const navigate: NavigateFn = async (to: string|number, options?: NavigateOptions<{}>) => {
  window.___navigate(withPrefix(to), options)
}

/**
 * @deprecated
 * TODO: Remove for Gatsby v3
 */
export const push = (to: string) => {
  showDeprecationWarning(`push`, `navigate`, 3)
  window.___push(withPrefix(to))
}

/**
 * @deprecated
 * TODO: Remove for Gatsby v3
 */
export const replace = (to: string) => {
  showDeprecationWarning(`replace`, `navigate`, 3)
  window.___replace(withPrefix(to))
}

/**
 * @deprecated
 * TODO: Remove for Gatsby v3
 */
export const navigateTo = (to: string) => {
  showDeprecationWarning(`navigateTo`, `navigate`, 3)
  return push(to)
}
