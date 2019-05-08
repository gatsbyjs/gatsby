import * as React from "react"
import { NavigateFn, LinkProps } from "@reach/router"

export interface GatsbyLinkProps<TState> extends LinkProps<TState> {
  activeClassName?: string
  activeStyle?: object
  innerRef?: Function
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void
  partiallyActive?: boolean
  replace?: boolean
  to: string
}

export default class GatsbyLink<TState> extends React.Component<
  GatsbyLinkProps<TState>,
  any
> {}
export const navigate: NavigateFn
export const withPrefix: (path: string) => string

// TODO: Remove navigateTo, push & replace for Gatsby v3
export const push: (to: string) => void
export const replace: (to: string) => void
export const navigateTo: (to: string) => void
