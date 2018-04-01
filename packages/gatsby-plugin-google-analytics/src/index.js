import React from "react"

export function OutBoundLink(props) {
  return (
    <a
      {...props}
      onClick={e => {
        ga("send", "event", "outbound", "click", props.href, {
          transport: "beacon",
          hitCallback: function() {
            document.location = props.href
          },
        })
        return false
      }}
    />
  )
}
