import React, { Ref } from "react"
import { Link, NavigateOptions, LinkGetProps } from "@reach/router"
import { IGatsbyLinkProps, IGetProps, IGatsbyLinkState, IIntersectionObserver } from "./types";

import { parsePath } from "./parse-path"

export { parsePath }

declare var __BASE_PATH__: string
declare var __PATH_PREFIX__: string
declare var ___loader: any;

/**
 * It is common to host sites in a sub-directory of a site. Gatsby lets you set the path prefix for your site.
 * After doing so, Gatsby's `<Link>` component will automatically handle constructing the correct URL in
 * development and production
 */
export function withPrefix(path: string): string {
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

// Set up IntersectionObserver
const createIntersectionObserver = (
  el: Element,
  cb: () => void
): IIntersectionObserver => {
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

class GatsbyLink<TState> extends React.Component<
  IGatsbyLinkProps<TState>,
  IGatsbyLinkState
> {
  io: IIntersectionObserver | undefined

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
    this.handleRef = this.handleRef.bind(this)
  }

  componentDidUpdate(prevProps: IGatsbyLinkProps<TState>): void {
    // Preserve non IO functionality if no support
    if (this.props.to !== prevProps.to && !this.state.IOSupported) {
      ___loader.enqueue(parsePath(this.props.to).pathname)
    }
  }

  componentDidMount(): void {
    // Preserve non IO functionality if no support
    if (!this.state.IOSupported) {
      ___loader.enqueue(parsePath(this.props.to).pathname)
    }
  }

  componentWillUnmount(): void {
    if (!this.io) {
      return
    }
    const { instance, el } = this.io

    instance.unobserve(el)
    instance.disconnect()
  }

  handleRef(ref: HTMLAnchorElement | null): void {
    if (this.props.innerRef && this.props.innerRef.hasOwnProperty(`current`)) {
      this.props.innerRef.current = ref
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

  defaultGetProps = ({
    isPartiallyCurrent,
    isCurrent,
  }: LinkGetProps): IGetProps => {
    if (this.props.partiallyActive ? isPartiallyCurrent : isCurrent) {
      return {
        className: [this.props.className, this.props.activeClassName]
          .filter(Boolean)
          .join(` `),
        style: { ...this.props.style, ...this.props.activeStyle },
      }
    }
    return {}
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
        innerRef={this.handleRef}
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
): void =>
  console.warn(
    `The "${functionName}" method is now deprecated and will be removed in Gatsby v${version}. Please use "${altFunctionName}" instead.`
  )

/**
 * This component is intended _only_ for links to pages handled by Gatsby. For links to pages on other
 * domains or pages on the same domain not handled by the current Gatsby site, use the normal `<a>` element.
 */
export default React.forwardRef((props, ref: Ref<HTMLAnchorElement>) => (
  <GatsbyLink innerRef={ref} {...props} />
))

/**
 * Sometimes you need to navigate to pages programmatically, such as during form submissions. In these
 * cases, `Link` won’t work.
 */
export const navigate = (to: string, options?: NavigateOptions<{}>): void => {
  window.___navigate(withPrefix(to), options)
}

/**
 * @deprecated
 * TODO: Remove for Gatsby v3
 */
export const push = (to: string): void => {
  showDeprecationWarning(`push`, `navigate`, 3)
  window.___push(withPrefix(to))
}

/**
 * @deprecated
 * TODO: Remove for Gatsby v3
 */
export const replace = (to: string): void => {
  showDeprecationWarning(`replace`, `navigate`, 3)
  window.___replace(withPrefix(to))
}

/**
 * @deprecated
 * TODO: Remove for Gatsby v3
 */
export const navigateTo = (to: string): void => {
  showDeprecationWarning(`navigateTo`, `navigate`, 3)
  return push(to)
}
