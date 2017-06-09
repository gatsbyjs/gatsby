import React from "react"
import { stripIndent } from "common-tags"

exports.onRenderBody = (
  { setHeadComponents, setPreBodyComponents },
  pluginOptions
) => {
  if (process.env.NODE_ENV === `production`) {
    setHeadComponents([
      <script
        dangerouslySetInnerHTML={{
          __html: stripIndent`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer', ${pluginOptions.id});`,
        }}
      />,
    ])

    return setPreBodyComponents([
      <div>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${pluginOptions.id}`}
          height="0"
          width="0"
          style={{ display : `none`, visibility: `hidden` }}
        >
        </iframe>
      </div>,
    ])
  }
}
