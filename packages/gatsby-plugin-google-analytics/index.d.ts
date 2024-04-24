import * as React from "react";

interface OutboundLinkProps {
  onClick?: ((event: React.MouseEvent<HTMLAnchorElement>) => void) | undefined;
  eventAction?: string | undefined;
  eventCategory?: string | undefined;
  eventLabel?: string | undefined;
}

export class OutboundLink extends React.Component<
  OutboundLinkProps & React.HTMLProps<HTMLAnchorElement>,
  any
> {}

export interface CustomEventArgs {
  category: string;
  action: string;
  label?: string | undefined;
  value?: number | undefined;
  nonInteraction?: boolean | undefined;
  transport?: "beacon" | "xhr" | "image" | undefined;
  hitCallback?: Function | undefined;
  callbackTimeout?: number | undefined;
}

export function trackCustomEvent(args: CustomEventArgs): void;
