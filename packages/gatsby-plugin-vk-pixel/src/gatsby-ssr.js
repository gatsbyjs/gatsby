import React from "react"
import { stripIndent } from "common-tags"

exports.onRenderBody = (
  { setHeadComponents, setPreBodyComponents },
  pluginOptions
) => {
  if (
    process.env.NODE_ENV === `production` ||
    pluginOptions.includeInDevelopment
  ) {
    setHeadComponents([
      <script
        key="plugin-vk-pixel"
        dangerouslySetInnerHTML={{
          __html: stripIndent`
            !function(){var t=document.createElement("script");t.type="text/javascript",
            t.async=!0,t.src="https://vk.com/js/api/openapi.js?154",t.onload=function()
            {VK.Retargeting.Init("${pluginOptions.id}"),VK.Retargeting.Hit()},
            document.head.appendChild(t)}();`,
        }}
      />,
    ])

    setPreBodyComponents([
      <noscript
        key="plugin-vk-pixel"
        dangerouslySetInnerHTML={{
          __html: stripIndent`
            <noscript>
              <img src="https://vk.com/rtrg?p=${
                pluginOptions.id
              }" style="position:fixed; left:-999px;" alt=""/>
            </noscript>`,
        }}
      />,
    ])
  }
}
