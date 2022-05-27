import React from "react"

interface IOutboundLinkProps {
  href: string
  target?: string
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void
}

const OutboundLink = React.forwardRef<HTMLAnchorElement, IOutboundLinkProps>(
  ({ children, ...props }, ref) => (
    <a
      ref={ref}
      {...props}
      onClick={(e): boolean => {
        if (typeof props.onClick === `function`) {
          props.onClick(e)
        }

        let redirect = true

        if (
          e.button !== 0 ||
          e.altKey ||
          e.ctrlKey ||
          e.metaKey ||
          e.shiftKey ||
          e.defaultPrevented
        ) {
          redirect = false
        }

        if (props.target && props.target.toLowerCase() !== `_self`) {
          redirect = false
        }

        // @ts-ignore gtag is global
        if (window.gtag) {
          // @ts-ignore gtag is global
          window.gtag(`event`, `click`, {
            event_category: `outbound`,
            event_label: props.href,
            transport_type: redirect ? `beacon` : ``,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            event_callback: function () {
              if (redirect) {
                document.location = props.href
              }
            },
          })
        } else {
          if (redirect) {
            document.location = props.href
          }
        }

        return false
      }}
    >
      {children}
    </a>
  )
)

export { OutboundLink }
