import React from "react"

exports.createPostBodyComponents = () => {
  if (process.env.NODE_ENV === `production`) {
    return [
      <script
        dangerouslySetInnerHTML={{
          __html: `
        if ('serviceWorker' in navigator) {
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
    ]
  }
}
