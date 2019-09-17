import React from "react"
import PropTypes from "prop-types"

function OutboundLink(props) {
  return (
    <a
      {...props}
      onClick={e => {
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
        if (window.ga) {
          window.ga(`send`, `event`, {
            eventCategory: `Outbound Link`,
            eventAction: `click`,
            eventLabel: props.href,
            transport: redirect ? `beacon` : ``,
            hitCallback: function() {
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
    />
  )
}

OutboundLink.propTypes = {
  href: PropTypes.string,
  target: PropTypes.string,
  onClick: PropTypes.func,
}

/**
 * This allows the user to create custom events within their Gatsby projects.
 * @param {string} category Required - The object that was interacted with (e.g.video)
 * @param {string} action Required - Type of interaction (e.g. 'play')
 * @param {string} label Optional - Useful for categorizing events (e.g. 'Spring Campaign')
 * @param {string} value Optional - Numeric value associated with the event. (e.g. A product ID)
 * @param {bool} nonInteraction Optional - If a hit is considered non-interactive.
 * @param {string} transport Optional - How the events will be sent. The options are 'beacon', 'xhr', or 'image'.
 *
 * @link https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference#events
 */
function trackCustomEvent({
  category,
  action,
  label,
  value,
  nonInteraction = true,
  transport,
}) {
  if (typeof window !== "undefined" && window.ga) {
    let trackingEventOptions = {
      eventCategory: category,
      eventAction: action,
      eventLabel: label,
      eventValue: value,
      nonInteraction: nonInteraction,
    }

    if (transport) {
      trackingEventOptions["transport"] = transport
    }

    window.ga(`send`, `event`, trackingEventOptions)
  }
}

export { OutboundLink, CustomTrackingEvent }
