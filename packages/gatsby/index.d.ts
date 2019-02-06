import * as React from "react"

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

export const useStaticQuery: (query: any) => null | object

export const graphql: (query: TemplateStringsArray) => void
