import React from "react"
import { LinkProps } from "reach__router"

export const push: (to: string) => void
export const replace: (to: string) => void

// TODO: Remove navigateTo for Gatsby v3
export const navigateTo: (to: string) => void

export const withPrefix: (path: string) => string

export interface GatsbyLinkProps extends LinkProps<any> {
  onClick?: (event: any) => void
  innerRef?: (instance: any) => void
  className?: string
  activeClassName?: string
  style?: React.CSSProperties
  activeStyle?: React.CSSProperties
}

export default class GatsbyLink extends React.Component<GatsbyLinkProps, any> {}
