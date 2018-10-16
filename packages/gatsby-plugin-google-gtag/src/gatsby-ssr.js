import React from "react"
import { Minimatch } from "minimatch"

export const onRenderBody = (
  { setHeadComponents, setPostBodyComponents },
  pluginOptions
) => {
  if (process.env.NODE_ENV !== `production`) return null

  const firstTrackingId =
    pluginOptions.trackingIds && pluginOptions.trackingIds.length
      ? pluginOptions.trackingIds[0]
      : ``

  const excludeGtagPaths = []
  if (typeof pluginOptions.pluginConfig.exclude !== `undefined`) {
    pluginOptions.pluginConfig.exclude.map(exclude => {
      const mm = new Minimatch(exclude)
      excludeGtagPaths.push(mm.makeRe())
    })
  }

  const setComponents = pluginOptions.pluginConfig.head
    ? setHeadComponents
    : setPostBodyComponents

  const renderHtml = () => `
      ${
        excludeGtagPaths.length
          ? `window.excludeGtagPaths=[${excludeGtagPaths.join(`,`)}];`
          : ``
      }
      ${
        typeof pluginOptions.gtagConfig.anonymize_ip !== `undefined` &&
        pluginOptions.gtagConfig.anonymize_ip === true
          ? `function gaOptout(){document.cookie=disableStr+'=true; expires=Thu, 31 Dec 2099 23:59:59 UTC;path=/',window[disableStr]=!0}var gaProperty='${firstTrackingId}',disableStr='ga-disable-'+gaProperty;document.cookie.indexOf(disableStr+'=true')>-1&&(window[disableStr]=!0);`
          : ``
      }
      if(${
        typeof pluginOptions.respectDNT !== `undefined` &&
        pluginOptions.respectDNT === true
          ? `!(navigator.doNotTrack == "1" || window.doNotTrack == "1")`
          : `true`
      }) {
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());

        ${pluginOptions.trackingIds
          .map(
            trackingId =>
              `gtag('config', '${trackingId}', ${JSON.stringify(
                pluginOptions.gtagConfig || {}
              )});`
          )
          .join(``)}
      }
      `

  return setComponents([
    <script
      key={`gatsby-plugin-google-gtag`}
      async
      src={`https://www.googletagmanager.com/gtag/js?id=${firstTrackingId}`}
    />,
    <script
      key={`gatsby-plugin-google-gtag-config`}
      dangerouslySetInnerHTML={{ __html: renderHtml() }}
    />,
  ])
}
