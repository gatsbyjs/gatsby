import React from "react"
import { stripIndent } from "common-tags"

export const onRenderBody = ({ setPostBodyComponents }, pluginOptions) => {
  const {
    appId,
    cookie = false,
    debug = false,
    includeInDevelopment = false,
    language = `en_US`,
    version = `v3.3`,
    xfbml = true,
  } = pluginOptions

  const sdkFile = debug === true ? `sdk/debug.js` : `sdk.js`

  if (process.env.NODE_ENV === `production` || includeInDevelopment || debug) {
    setPostBodyComponents([
      <script
        key="plugin-facebook-analytics"
        dangerouslySetInnerHTML={{
          __html: stripIndent(`
            window.fbAsyncInit = function() {
              FB.init({
                appId      : ${appId},
                cookie     : ${cookie},
                version    : '${version}',
                xfbml      : ${xfbml},
              });

              FB.AppEvents.logPageView();
            };

            (function(d, s, id){
              var js, fjs = d.getElementsByTagName(s)[0];
              if (d.getElementById(id)) {return;}
              js = d.createElement(s); js.id = id;
              js.src = "https://connect.facebook.net/${language}/${sdkFile}";
              fjs.parentNode.insertBefore(js, fjs);
            }(document, 'script', 'facebook-jssdk'));
        `),
        }}
      />,
    ])
  }
}
