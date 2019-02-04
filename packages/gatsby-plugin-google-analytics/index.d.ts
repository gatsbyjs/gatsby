import * as React from "react"

interface OutboundLinkProps {
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void
}

class OutboundLink extends React.Component<
  OutboundLinkProps & React.HTMLProps<HTMLAnchorElement>,
  any
> {}
export { OutboundLink }
