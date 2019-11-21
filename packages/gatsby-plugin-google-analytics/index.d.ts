import * as React from "react"

interface OutboundLinkProps {
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void
}

export class OutboundLink extends React.Component<
  OutboundLinkProps & React.HTMLProps<HTMLAnchorElement>,
  any
> {}

export interface CustomEventArgs {
  category: string
  action: string
  label?: string
  value?: string
  nonInteraction: boolean
  transport: "beacon" | "xhr" | "image"
  hitCallback: Function
  callbackTimeout: Number
}

export function trackCustomEvent(args: CustomEventArgs): void
