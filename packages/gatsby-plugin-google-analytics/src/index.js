import React from "react"
import PropTypes from "prop-types"

const createFunctionWithTimeout = (callback, opt_timeout = 1000) => {
  let called = false
  const raceCallback = () => {
    if (!called) {
      called = true
      callback()
    }
  }
  setTimeout(raceCallback, opt_timeout)
  return raceCallback
}

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
 *
 * @param {import('gatsby-plugin-google-analytics').CustomEventArgs} args
 * @see https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference#events
 */
function trackCustomEvent({
  category,
  action,
  label,
  value,
  nonInteraction = true,
  transport,
  hitCallback,
  callbackTimeout = 1000,
}) {
  if (typeof window !== `undefined` && window.ga) {
    const trackingEventOptions = {
      eventCategory: category,
      eventAction: action,
      eventLabel: label,
      eventValue: value,
      nonInteraction: nonInteraction,
      transport,
    }

    if (hitCallback && typeof hitCallback === `function`) {
      trackingEventOptions.hitCallback = createFunctionWithTimeout(
        hitCallback,
        callbackTimeout
      )
    }

    window.ga(`send`, `event`, trackingEventOptions)
  }
}

export { OutboundLink, trackCustomEvent }
