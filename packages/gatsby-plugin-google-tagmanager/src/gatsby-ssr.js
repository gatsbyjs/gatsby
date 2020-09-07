import React from "react"
import { oneLine, stripIndent } from "common-tags"

const generateGTM = ({ id, environmentParamStr, dataLayerName }) => stripIndent`
  (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://www.googletagmanager.com/gtm.js?id='+i+dl+'${environmentParamStr}';f.parentNode.insertBefore(j,f);
  })(window,document,'script','${dataLayerName}', '${id}');`

const generateGTMIframe = ({ id, environmentParamStr }) =>
  oneLine`<iframe src="https://www.googletagmanager.com/ns.html?id=${id}${environmentParamStr}" height="0" width="0" style="display: none; visibility: hidden"></iframe>`

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

// If optimizeId is provided by a user, it will install anti-flicker snippet
// code.
//
// See https://developers.google.com/optimize#the_anti-flicker_snippet_code
const generateOptimizeAntiFlickerSnippet = optimizeId => {
  if (!optimizeId) {
    return []
  }

  return [
    <style
      key="plugin-google-tagmanager-anti-flicker-css"
      dangerouslySetInnerHTML={{
        __html: stripIndent`.async-hide { opacity: 0 !important}`,
      }}
    />,
    <script
      key="plugin-google-tagmanager-anti-flicker-js"
      dangerouslySetInnerHTML={{
        __html: stripIndent`
(function(a,s,y,n,c,h,i,d,e){s.className+=' '+y;h.start=1*new Date;
h.end=i=function(){s.className=s.className.replace(RegExp(' ?'+y),'')};
(a[n]=a[n]||[]).hide=h;setTimeout(function(){i();h.end=null},c);h.timeout=c;
})(window,document.documentElement,'async-hide','dataLayer',4000,
{${optimizeId}:true});`,
      }}
    />,
  ]
}

exports.onRenderBody = (
  { setHeadComponents, setPreBodyComponents, reporter },
  {
    id,
    includeInDevelopment = false,
    optimizeId = ``,
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

    const headComponents = []

    if (defaultDataLayerCode) {
      headComponents.push(
        <script
          key="plugin-google-tagmanager-dataLayer"
          dangerouslySetInnerHTML={{
            __html: oneLine`${defaultDataLayerCode}`,
          }}
        />
      )
    }

    if (optimizeId) {
      headComponents.push(...generateOptimizeAntiFlickerSnippet(optimizeId))
    }

    headComponents.push(
      <script
        key="plugin-google-tagmanager-gtm"
        dangerouslySetInnerHTML={{
          __html: oneLine`${generateGTM({
            id,
            environmentParamStr,
            dataLayerName,
          })}`,
        }}
      />
    )

    setHeadComponents(headComponents)

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
