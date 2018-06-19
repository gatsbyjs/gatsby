import * as React from "react"

export {
  default as Link,
  GatsbyLinkProps,
  navigateTo,
  push,
  replace,
  withPrefix
} from "gatsby-link"

interface StaticQueryRenderProps {
  data: any
}

type RenderCallback = (props: StaticQueryRenderProps) => JSX.Element

export interface StaticQueryProps {
  query: any
  render: RenderCallback
}

export class StaticQuery extends React.Component<StaticQueryProps> {}
