import { Minimatch } from "minimatch"

export function createSnippet(relevantPluginOptions) {
  const { gtagConfig, exclude, respectDNT, trackingIds } = relevantPluginOptions

  // Prevent duplicate or excluded pageview events being emitted on initial load of page by the `config` command
  // https://developers.google.com/analytics/devguides/collection/gtagjs/#disable_pageview_tracking
  gtagConfig.send_page_view = false

  const excludeGtagPaths = []

  exclude.map(exclude => {
    const mm = new Minimatch(exclude)
    excludeGtagPaths.push(mm.makeRe())
  })

  return `
    ${
      excludeGtagPaths.length
        ? `window.excludeGtagPaths=[${excludeGtagPaths.join(`,`)}];`
        : ``
    }
    ${
      typeof gtagConfig.anonymize_ip !== `undefined` &&
      gtagConfig.anonymize_ip === true
        ? `function gaOptout(){document.cookie=disableStr+'=true; expires=Thu, 31 Dec 2099 23:59:59 UTC;path=/',window[disableStr]=!0}var gaProperty='${
            trackingIds?.[0] || ``
          }',disableStr='ga-disable-'+gaProperty;document.cookie.indexOf(disableStr+'=true')>-1&&(window[disableStr]=!0);`
        : ``
    }
    if(${
      respectDNT
        ? `!(navigator.doNotTrack == "1" || window.doNotTrack == "1")`
        : `true`
    }) {
      window.dataLayer = window.dataLayer || [];
      function gtag(){window.dataLayer && window.dataLayer.push(arguments);}
      gtag('js', new Date());

      ${trackingIds
        .map(
          trackingId =>
            `gtag('config', '${trackingId}', ${JSON.stringify(gtagConfig)});`
        )
        .join(``)}
    }`
}
