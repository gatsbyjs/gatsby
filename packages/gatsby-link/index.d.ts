import * as React from "react"
import { NavigateFn, LinkProps } from "@reach/router"

export interface GatsbyLinkProps extends LinkProps {
  activeClassName?: string
  activeStyle?: object
  innerRef?: Function
  onClick?: Function
  to: string
}

export default class GatsbyLink extends React.Component<GatsbyLinkProps, any> {}
export const navigate: NavigateFn
export const withPrefix: (path: string) => string

// TODO: Remove navigateTo, push & replace for Gatsby v3
export const push: (to: string) => void
export const replace: (to: string) => void
export const navigateTo: (to: string) => void
