import { CSSProperties, Ref } from "react"
import { NavigateOptions, LinkProps } from "@reach/router"

declare global {
  interface Window {
    ___push: (to: string) => void
    ___replace: (to: string) => void
    ___navigate: (to: string, options?: NavigateOptions<{}>) => void
  }
}

export interface IGetProps {
  className?: string
  style?: CSSProperties
}

export interface IIntersectionObserver {
  instance: IntersectionObserver
  el: Element
}

export interface IGatsbyLinkState {
  IOSupported: boolean
}

export interface IGatsbyLinkProps<TState> extends LinkProps<TState> {
  /** A class to apply when this Link is active */
  activeClassName?: string
  /** Inline styles for when this Link is active */
  activeStyle?: object
  /** Class the link as highlighted if there is a partial match via a the `to` being prefixed to the current url */
  partiallyActive?: boolean
  innerRef: Ref<HTMLAnchorElement>
}

export interface IParsePathResult {
  pathname: string
  search: string
  hash: string
}
