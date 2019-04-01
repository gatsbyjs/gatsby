import * as React from "react"
import { WindowLocation } from "@reach/router"

export {
  default as Link,
  GatsbyLinkProps,
  navigate,
  navigateTo,
  push,
  replace,
  withPrefix,
} from "gatsby-link"

type RenderCallback = (data: any) => React.ReactNode

export interface StaticQueryProps {
  query: any
  render?: RenderCallback
  children?: RenderCallback
}

export class StaticQuery extends React.Component<StaticQueryProps> {}

export const useStaticQuery: <TData = any>(query: any) => TData

export const graphql: (query: TemplateStringsArray) => void

export const parsePath: (path: string) => WindowLocation

export interface PageRendererProps {
  location: WindowLocation
}

export class PageRenderer extends React.Component<PageRendererProps> {}
