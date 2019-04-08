const React = require(`react`)

exports.onRenderBody = function onRenderBody(
  { setPostBodyComponents, reporter },
  { appId }
) {
  if (!appId) {
    reporter.warn(`An appId is required to use gatsby-plugin-firebase-perf`)
    return
  }

  setPostBodyComponents([
    <script
      key="gatsby-plugin-firebase-perf"
      dangerouslySetInnerHTML={{
        __html: `
      (function(sa,gai){function load(f,c){var a=document.createElement('script');
      a.async=1;a.src=f;a.onload=c;var s=document.getElementsByTagName('script')[0];
      s.parentNode.insertBefore(a,s);}load(sa);window.onload = function() {firebase.initializeApp({appId:gai}).performance();};
      })('https://earlymonitoring.firebaseapp.com/index.min.js', ${appId});
      `,
      }}
    />,
  ])
}
