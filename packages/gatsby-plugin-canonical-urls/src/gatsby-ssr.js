import React from "react"
import url from "url"

exports.onRenderBody = (
  { setHeadComponents, pathname = `/` },
  pluginOptions
) => {
  if (pluginOptions && pluginOptions.siteUrl) {
    const parsedUrl = url.parse(pluginOptions.siteUrl)
    let myUrl = `${pluginOptions.siteUrl}${pathname}`
    console.log(`What are plugin options ${JSON.stringify(pluginOptions)}`)
    if(pluginOptions.requireTrailingSlash || false) {
      console.log(`Requiring trailing slash on url ${myUrl}`)
      myUrl = myUrl.replace(/\/$|$/, `/`)
      console.log(`Finished: ${myUrl}`)
    }
    setHeadComponents([
      <link
        rel="canonical"
        key={myUrl}
        href={myUrl}
        data-baseprotocol={parsedUrl.protocol}
        data-basehost={parsedUrl.host}
      />,
    ])
  }
}
