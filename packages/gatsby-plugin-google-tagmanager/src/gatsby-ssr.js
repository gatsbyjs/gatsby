import React from "react"
import { oneLine, stripIndent } from "common-tags"

const convertDataLayer = datalayer => {
  if (typeof datalayer === `string`) {
    return datalayer
  }

  return JSON.stringify(datalayer)
}

exports.onRenderBody = (
  { setHeadComponents, setPreBodyComponents },
  {
    id,
    includeInDevelopment = false,
    gdpr = false,
    gdprConsent = `gdprConsent`,
    gtmAuth,
    gtmPreview,
    defaultDataLayer,
  }
) => {
  if (process.env.NODE_ENV === `production` || includeInDevelopment) {
    const environmentParamStr =
      gtmAuth && gtmPreview
        ? oneLine`
      &gtm_auth=${gtmAuth}&gtm_preview=${gtmPreview}&gtm_cookies_win=x
    `
        : ``

    let defaultDataLayerCode
    if (defaultDataLayer) {
      defaultDataLayerCode = `dataLayer = [${convertDataLayer(
        defaultDataLayer
      )}];`
    }

    setHeadComponents([
      <script
        key="plugin-google-tagmanager"
        dangerouslySetInnerHTML={{
          __html: stripIndent`
            ${defaultDataLayerCode}
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl+'${environmentParamStr}';f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer', '${id}');`,
        }}
      />,
    ])

    // TODO: add a test to verify iframe contains no line breaks. Ref: https://github.com/gatsbyjs/gatsby/issues/11014
    setPreBodyComponents([
      <noscript
        key="plugin-google-tagmanager"
        dangerouslySetInnerHTML={{
          __html: stripIndent`
            <iframe src="https://www.googletagmanager.com/ns.html?id=${id}${environmentParamStr}" height="0" width="0" style="display: none; visibility: hidden"></iframe>`,
        }}
      />,
    ])
  }
}
