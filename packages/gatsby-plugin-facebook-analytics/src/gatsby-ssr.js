import React from "react"
import { stripIndent } from "common-tags"

exports.onRenderBody = ({ setPostBodyComponents }, pluginOptions) => {
  if (
    process.env.NODE_ENV === `production` ||
    pluginOptions.includeInDevelopment
  ) {
    setPostBodyComponents([
      <script
        key="plugin-google-tagmanager"
        dangerouslySetInnerHTML={{
          __html: stripIndent`
          window.fbAsyncInit = function() {
            FB.init({
              appId      : ${pluginOptions.appId},
              xfbml      : true,
              version    : 'v2.12'
            });

            FB.AppEvents.logPageView();

          };

          (function(d, s, id){
             var js, fjs = d.getElementsByTagName(s)[0];
             if (d.getElementById(id)) {return;}
             js = d.createElement(s); js.id = id;
             js.src = "https://connect.facebook.net/en_US/sdk.js";
             fjs.parentNode.insertBefore(js, fjs);
           }(document, 'script', 'facebook-jssdk'));`,
        }}
      />,
    ])
  }
}
