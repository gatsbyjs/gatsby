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
 *
 * @link https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference#events
 */
function trackCustomEvent({ category, action, label, value }) {
  if (typeof window !== "undefined" && window.ga) {
    window.ga(`send`, `event`, {
      eventCategory: category,
      eventAction: action,
      eventLabel: label,
      eventValue: value,
    })
  }
}

CustomTrackingEvent.propTypes = {
  category: PropTypes.string.isRequired,
  action: PropTypes.string.isRequired,
  label: PropTypes.string,
  value: PropTypes.number,
}

export { OutboundLink, CustomTrackingEvent }
