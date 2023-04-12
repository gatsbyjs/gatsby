import React from "react"
import PropTypes from "prop-types"

const OutboundLink = React.forwardRef(
  (
    { children, eventCategory, eventAction, eventLabel, eventValue, ...rest },
    ref
  ) => (
    <a
      ref={ref}
      {...rest}
      onClick={e => {
        if (typeof rest.onClick === `function`) {
          rest.onClick(e)
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
        if (rest.target && rest.target.toLowerCase() !== `_self`) {
          redirect = false
        }
        if (window.gtag) {
          window.gtag(`event`, eventAction || `click`, {
            event_category: eventCategory || `outbound`,
            event_label: eventLabel || rest.href,
            event_value: eventValue,
            transport_type: redirect ? `beacon` : ``,
            event_callback: function () {
              if (redirect) {
                document.location = rest.href
              }
            },
          })
        } else {
          if (redirect) {
            document.location = rest.href
          }
        }

        return false
      }}
    >
      {children}
    </a>
  )
)

OutboundLink.propTypes = {
  eventAction: PropTypes.string,
  eventCategory: PropTypes.string,
  eventLabel: PropTypes.string,
  eventValue: PropTypes.number,
  href: PropTypes.string,
  target: PropTypes.string,
  onClick: PropTypes.func,
}

export { OutboundLink }
