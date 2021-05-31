import React from "react"

const knownOptions = {
  createOnly: {
    clientId: `string`,
    sampleRate: `number`,
    siteSpeedSampleRate: `number`,
    alwaysSendReferrer: `boolean`,
    allowAnchor: `boolean`,
    cookieName: `string`,
    cookieFlags: `string`,
    cookieExpires: `number`,
    storeGac: `boolean`,
    legacyCookieDomain: `string`,
    legacyHistoryImport: `boolean`,
    allowLinker: `boolean`,
    storage: `string`,
  },
  general: {
    allowAdFeatures: `boolean`,
    dataSource: `string`,
    queueTime: `number`,
    forceSSL: `boolean`,
    transport: `string`,
  },
}

export const onRenderBody = (
  { setHeadComponents, setPostBodyComponents },
  pluginOptions
) => {
  if (process.env.NODE_ENV !== `production` || !pluginOptions.trackingId) {
    return null
  }

  // Lighthouse recommends pre-connecting to google analytics
  setHeadComponents([
    <link
      rel="preconnect"
      key="preconnect-google-analytics"
      href="https://www.google-analytics.com"
    />,
    <link
      rel="dns-prefetch"
      key="dns-prefetch-google-analytics"
      href="https://www.google-analytics.com"
    />,
  ])

  const excludeGAPaths = []
  if (typeof pluginOptions.exclude !== `undefined`) {
    const Minimatch = require(`minimatch`).Minimatch
    pluginOptions.exclude.map(exclude => {
      const mm = new Minimatch(exclude)
      excludeGAPaths.push(mm.makeRe())
    })
  }

  const gaCreateOptions = {}
  for (const option in knownOptions.createOnly) {
    if (typeof pluginOptions[option] === knownOptions.createOnly[option]) {
      gaCreateOptions[option] = pluginOptions[option]
    }
  }

  const setComponents = pluginOptions.head
    ? setHeadComponents
    : setPostBodyComponents

  const inlineScripts = []
  if (!pluginOptions.disableWebVitalsTracking) {
    inlineScripts.push(
      <script
        key={`gatsby-plugin-google-analytics-web-vitals`}
        data-gatsby="web-vitals-polyfill"
        dangerouslySetInnerHTML={{
          __html: `
            !function(){var e,t,n,i,r={passive:!0,capture:!0},a=new Date,o=function(){i=[],t=-1,e=null,f(addEventListener)},c=function(i,r){e||(e=r,t=i,n=new Date,f(removeEventListener),u())},u=function(){if(t>=0&&t<n-a){var r={entryType:"first-input",name:e.type,target:e.target,cancelable:e.cancelable,startTime:e.timeStamp,processingStart:e.timeStamp+t};i.forEach((function(e){e(r)})),i=[]}},s=function(e){if(e.cancelable){var t=(e.timeStamp>1e12?new Date:performance.now())-e.timeStamp;"pointerdown"==e.type?function(e,t){var n=function(){c(e,t),a()},i=function(){a()},a=function(){removeEventListener("pointerup",n,r),removeEventListener("pointercancel",i,r)};addEventListener("pointerup",n,r),addEventListener("pointercancel",i,r)}(t,e):c(t,e)}},f=function(e){["mousedown","keydown","touchstart","pointerdown"].forEach((function(t){return e(t,s,r)}))},p="hidden"===document.visibilityState?0:1/0;addEventListener("visibilitychange",(function e(t){"hidden"===document.visibilityState&&(p=t.timeStamp,removeEventListener("visibilitychange",e,!0))}),!0);o(),self.webVitals={firstInputPolyfill:function(e){i.push(e),u()},resetFirstInputPolyfill:o,get firstHiddenTime(){return p}}}();
          `,
        }}
      />
    )
  }

  inlineScripts.push(
    <script
      key={`gatsby-plugin-google-analytics`}
      dangerouslySetInnerHTML={{
        __html: `
  ${
    excludeGAPaths.length
      ? `window.excludeGAPaths=[${excludeGAPaths.join(`,`)}];`
      : ``
  }
  ${
    typeof pluginOptions.anonymize !== `undefined` &&
    pluginOptions.anonymize === true
      ? `function gaOptout(){document.cookie=disableStr+'=true; expires=Thu, 31 Dec 2099 23:59:59 UTC;path=/',window[disableStr]=!0}var gaProperty='${pluginOptions.trackingId}',disableStr='ga-disable-'+gaProperty;document.cookie.indexOf(disableStr+'=true')>-1&&(window[disableStr]=!0);`
      : ``
  }
  if(${
    typeof pluginOptions.respectDNT !== `undefined` &&
    pluginOptions.respectDNT == true
      ? `!(parseInt(navigator.doNotTrack) === 1 || parseInt(window.doNotTrack) === 1 || parseInt(navigator.msDoNotTrack) === 1 || navigator.doNotTrack === "yes")`
      : `true`
  }) {
    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];${
      pluginOptions.defer ? `a.defer=1;` : `a.async=1;`
    }a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
  }
  if (typeof ga === "function") {
    ga('create', '${pluginOptions.trackingId}', '${
          typeof pluginOptions.cookieDomain === `string`
            ? pluginOptions.cookieDomain
            : `auto`
        }', ${
          typeof pluginOptions.name === `string`
            ? `'${pluginOptions.name}', `
            : ``
        }${JSON.stringify(gaCreateOptions)});
      ${
        typeof pluginOptions.anonymize !== `undefined` &&
        pluginOptions.anonymize === true
          ? `ga('set', 'anonymizeIp', true);`
          : ``
      }
      ${
        typeof pluginOptions.optimizeId !== `undefined`
          ? `ga('require', '${pluginOptions.optimizeId}');`
          : ``
      }
      ${
        typeof pluginOptions.experimentId !== `undefined`
          ? `ga('set', 'expId', '${pluginOptions.experimentId}');`
          : ``
      }
      ${
        typeof pluginOptions.variationId !== `undefined`
          ? `ga('set', 'expVar', '${pluginOptions.variationId}');`
          : ``
      }
      ${Object.keys(knownOptions.general).reduce((gaSetCommands, option) => {
        if (typeof pluginOptions[option] === knownOptions.general[option]) {
          gaSetCommands += `ga('set', '${option}', '${pluginOptions[option]}');\n`
        }
        return gaSetCommands
      }, ``)}
      }`,
      }}
    />
  )

  return setComponents(inlineScripts)
}
