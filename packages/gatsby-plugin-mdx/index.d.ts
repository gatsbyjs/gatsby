import * as React from "react"

export interface MDXRendererProps {
  scope?: any
  components?: {
    [key: string]: React.ComponentType<any>
  }
  children: string
  [propName: string]: any
}

export class MDXRenderer extends React.Component<MDXRendererProps> {}
