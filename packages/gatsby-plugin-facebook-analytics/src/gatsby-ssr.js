import React from "react"
import { stripIndent } from "common-tags"

exports.onRenderBody = ({ setPostBodyComponents }, pluginOptions) => {
  const {
    appId,
    includeInDevelopment = false,
    debug = false,
    language = `en_US`,
  } = pluginOptions

  if (process.env.NODE_ENV === `production` || includeInDevelopment || debug) {
    setPostBodyComponents([
      <script
        key="plugin-facebook-analitycs"
        dangerouslySetInnerHTML={{
          __html: stripIndent`
          window.fbAsyncInit = function() {
            FB.init({
              appId      : ${appId},
              xfbml      : true,
              version    : 'v2.12'
            });

            FB.AppEvents.logPageView();

          };

          (function(d, s, id){
             var js, fjs = d.getElementsByTagName(s)[0];
             if (d.getElementById(id)) {return;}
             js = d.createElement(s); js.id = id;
             js.src = "https://connect.facebook.net/${language}/sdk${
            debug ? `/debug.js` : `.js`
          }";
             fjs.parentNode.insertBefore(js, fjs);
           }(document, 'script', 'facebook-jssdk'));`,
        }}
      />,
    ])
  }
}
