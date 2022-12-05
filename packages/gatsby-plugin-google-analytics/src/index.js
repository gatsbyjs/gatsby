import React from "react"
import PropTypes from "prop-types"

const createFunctionWithTimeout = (callback, optTimeout = 1000) => {
  let called = false
  const raceCallback = () => {
    if (!called) {
      called = true
      callback()
    }
  }
  setTimeout(raceCallback, optTimeout)
  return raceCallback
}

function OutboundLink(props) {
  const { eventCategory, eventAction, eventLabel, eventValue, ...rest } = props
  return (
    <a
      {...rest}
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
            eventCategory: eventCategory || `Outbound Link`,
            eventAction: eventAction || `click`,
            eventLabel: eventLabel || props.href,
            eventValue,
            transport: redirect ? `beacon` : ``,
            hitCallback: function () {
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
  eventCategory: PropTypes.string,
  eventAction: PropTypes.string,
  eventLabel: PropTypes.string,
  eventValue: PropTypes.number,
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
  nonInteraction = false,
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
