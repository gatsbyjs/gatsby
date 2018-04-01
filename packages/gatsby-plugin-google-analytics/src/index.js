import React from "react"
import PropTypes from "prop-types"

function OutboundLink(props) {
  return (
    <a
      {...props}
      onClick={e => {
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

        if (window.ga) {
          ga(`send`, `event`, {
            eventCategory: `Outbound Link`,
            eventAction: `click`,
            eventLabel: props.href,
            transport: `beacon`,
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
}

export { OutboundLink }
