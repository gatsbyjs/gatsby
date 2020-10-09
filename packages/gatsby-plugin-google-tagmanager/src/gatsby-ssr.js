import React from "react"
import { oneLine, stripIndent } from "common-tags"

const generateGTM = ({ id, environmentParamStr, dataLayerName }) => stripIndent`
  (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://www.googletagmanager.com/gtm.js?id='+i+dl+'${environmentParamStr}';f.parentNode.insertBefore(j,f);
  })(window,document,'script','${dataLayerName}', '${id}');`

const generateGTMIframe = ({ id, environmentParamStr }) =>
  oneLine`<iframe src="https://www.googletagmanager.com/ns.html?id=${id}${environmentParamStr}" height="0" width="0" style="display: none; visibility: hidden" aria-hidden="true"></iframe>`

const generateDefaultDataLayer = (dataLayer, reporter, dataLayerName) => {
  let result = `window.${dataLayerName} = window.${dataLayerName} || [];`

  if (dataLayer.type === `function`) {
    result += `window.${dataLayerName}.push((${dataLayer.value})());`
  } else {
    if (dataLayer.type !== `object` || dataLayer.value.constructor !== Object) {
      reporter.panic(
        `Oops the plugin option "defaultDataLayer" should be a plain object. "${dataLayer}" is not valid.`
      )
    }

    result += `window.${dataLayerName}.push(${JSON.stringify(
      dataLayer.value
    )});`
  }

  return stripIndent`${result}`
}

exports.onRenderBody = (
  { setHeadComponents, setPreBodyComponents, reporter },
  {
    id,
    includeInDevelopment = false,
    gtmAuth,
    gtmPreview,
    defaultDataLayer,
    dataLayerName = `dataLayer`,
  }
) => {
  if (process.env.NODE_ENV === `production` || includeInDevelopment) {
    const environmentParamStr =
      gtmAuth && gtmPreview
        ? oneLine`
      &gtm_auth=${gtmAuth}&gtm_preview=${gtmPreview}&gtm_cookies_win=x
    `
        : ``

    let defaultDataLayerCode = ``
    if (defaultDataLayer) {
      defaultDataLayerCode = generateDefaultDataLayer(
        defaultDataLayer,
        reporter,
        dataLayerName
      )
    }

    setHeadComponents([
      <script
        key="plugin-google-tagmanager"
        dangerouslySetInnerHTML={{
          __html: oneLine`
            ${defaultDataLayerCode}
            ${generateGTM({ id, environmentParamStr, dataLayerName })}`,
        }}
      />,
    ])

    setPreBodyComponents([
      <noscript
        key="plugin-google-tagmanager"
        dangerouslySetInnerHTML={{
          __html: generateGTMIframe({ id, environmentParamStr }),
        }}
      />,
    ])
  }
}
