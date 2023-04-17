// @ts-check

import React from "react"
import { Minimatch } from "minimatch"

/**
 * @type {import('gatsby').GatsbySSR["onRenderBody"]}
 */
exports.onRenderBody = (
  { setHeadComponents, setPostBodyComponents },
  { trackingIds, gtagConfig, pluginConfig }
) => {
  if (
    process.env.NODE_ENV !== `production` &&
    process.env.NODE_ENV !== `test`
  ) {
    return null
  }

  // Lighthouse recommends pre-connecting to google tag manager
  setHeadComponents([
    <link
      rel="preconnect"
      key="preconnect-google-gtag"
      href={pluginConfig.origin}
    />,
    <link
      rel="dns-prefetch"
      key="dns-prefetch-google-gtag"
      href={pluginConfig.origin}
    />,
  ])

  // Prevent duplicate or excluded pageview events being emitted on initial load of page by the `config` command
  // https://developers.google.com/analytics/devguides/collection/gtagjs/#disable_pageview_tracking

  gtagConfig.send_page_view = false

  const firstTrackingId = trackingIds[0]

  const excludeGtagPaths = []
  if (pluginConfig.exclude.length > 0) {
    pluginConfig.exclude.map(exclude => {
      const mm = new Minimatch(exclude)
      excludeGtagPaths.push(mm.makeRe())
    })
  }

  const setComponents = pluginConfig.head
    ? setHeadComponents
    : setPostBodyComponents

  const renderHtml = () => `
      ${
        excludeGtagPaths.length
          ? `window.excludeGtagPaths=[${excludeGtagPaths.join(`,`)}];`
          : ``
      }
      ${
        gtagConfig.anonymize_ip === true
          ? `function gaOptout(){document.cookie=disableStr+'=true; expires=Thu, 31 Dec 2099 23:59:59 UTC;path=/',window[disableStr]=!0}var gaProperty='${firstTrackingId}',disableStr='ga-disable-'+gaProperty;document.cookie.indexOf(disableStr+'=true')>-1&&(window[disableStr]=!0);`
          : ``
      }
      if(${
        pluginConfig.respectDNT === true
          ? `!(navigator.doNotTrack == "1" || window.doNotTrack == "1")`
          : `true`
      }) {
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());

        ${trackingIds
          .map(
            trackingId =>
              `gtag('config', '${trackingId}', ${JSON.stringify(gtagConfig)});`
          )
          .join(``)}
      }
      `

  return setComponents([
    <script
      key={`gatsby-plugin-google-gtag`}
      async
      src={`${pluginConfig.origin}/gtag/js?id=${firstTrackingId}`}
    />,
    <script
      key={`gatsby-plugin-google-gtag-config`}
      dangerouslySetInnerHTML={{ __html: renderHtml() }}
    />,
  ])
}
