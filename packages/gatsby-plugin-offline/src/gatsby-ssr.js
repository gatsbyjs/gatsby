import React from "react"

exports.onRenderBody = ({ setPostBodyComponents }) => {
  if (process.env.NODE_ENV === `production`) {
    return setPostBodyComponents([
      <script
        dangerouslySetInnerHTML={{
          __html: `
        if ('serviceWorker' in navigator) {
          // TODO load service worker in onClientEntry
          //
          // Delay registration until after the page has loaded, to ensure that
          // our precaching requests don't degrade the first visit experience.
          // See https://developers.google.com/web/fundamentals/instant-and-offline/service-worker/registration
          window.addEventListener('load', function() {
            navigator.serviceWorker.register('/sw.js');
          })
        }
      `,
        }}
      />,
    ])
  }
}
