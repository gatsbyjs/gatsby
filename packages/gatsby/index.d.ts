import * as React from "react"

interface StaticQueryRenderProps {
  data: any
}

type RenderCallback = (props: StaticQueryRenderProps) => JSX.Element

export interface StaticQueryProps {
  query: any
  render: RenderCallback
}

export class StaticQuery extends React.Component<Partial<StaticQueryProps>> {}

export function stripPrefix(str: string, prefix?: string): string

export function withPrefix(path: string): string
