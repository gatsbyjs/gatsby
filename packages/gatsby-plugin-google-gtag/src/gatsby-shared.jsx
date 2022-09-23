import React from "react"
import { Script, ScriptStrategy } from "gatsby"
import { Minimatch } from "minimatch"

export const wrapPageElement = ({ element }, pluginOptions) => {
  if (process.env.NODE_ENV !== `production` && process.env.NODE_ENV !== `test`)
    return null

  const gtagConfig = pluginOptions.gtagConfig || {}
  const pluginConfig = pluginOptions.pluginConfig || {}
  const origin = pluginConfig.origin || `https://www.googletagmanager.com`

  // Prevent duplicate or excluded pageview events being emitted on initial load of page by the `config` command
  // https://developers.google.com/analytics/devguides/collection/gtagjs/#disable_pageview_tracking

  gtagConfig.send_page_view = false

  const firstTrackingId =
    pluginOptions.trackingIds && pluginOptions.trackingIds.length
      ? pluginOptions.trackingIds[0]
      : ``

  const excludeGtagPaths = []
  if (typeof pluginConfig.exclude !== `undefined`) {
    pluginConfig.exclude.map(exclude => {
      const mm = new Minimatch(exclude)
      excludeGtagPaths.push(mm.makeRe())
    })
  }

  const renderHtml = () => `
      ${
        excludeGtagPaths.length
          ? `window.excludeGtagPaths=[${excludeGtagPaths.join(`,`)}];`
          : ``
      }
      ${
        typeof gtagConfig.anonymize_ip !== `undefined` &&
        gtagConfig.anonymize_ip === true
          ? `function gaOptout(){document.cookie=disableStr+'=true; expires=Thu, 31 Dec 2099 23:59:59 UTC;path=/',window[disableStr]=!0}var gaProperty='${firstTrackingId}',disableStr='ga-disable-'+gaProperty;document.cookie.indexOf(disableStr+'=true')>-1&&(window[disableStr]=!0);`
          : ``
      }
      if(${
        pluginConfig.respectDNT
          ? `!(navigator.doNotTrack == "1" || window.doNotTrack == "1")`
          : `true`
      }) {
        window.dataLayer = window.dataLayer || [];
        window.gtag = window.gtag || function gtag(){ window.dataLayer.push(arguments);}
        gtag('js', new Date());

        ${pluginOptions.trackingIds
          .map(
            trackingId =>
              `gtag('config', '${trackingId}', ${JSON.stringify(gtagConfig)});`
          )
          .join(``)}
      }
      `
  const strategy = pluginConfig.strategy || ScriptStrategy.postHydrate

  return (
    <>
      {element}
      <Script
        id="gatsby-plugin-google-gtag"
        strategy={strategy}
        forward={[`dataLayer.push`]}
        src={`${origin}/gtag/js?id=${firstTrackingId}`}
      />
      <Script
        id="gatsby-plugin-google-gtag-config"
        strategy={strategy}
        forward={[`gtag`]}
        dangerouslySetInnerHTML={{
          __html: renderHtml(),
        }}
      />
    </>
  )
}
