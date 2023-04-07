import * as React from "react"
import { data } from "../../../shared-data/head-function-export"

export default function HeadFunctionExportSSR() {
  return (
    <h1>
      I test the Head function export in an SSR page (using getServerData)
    </h1>
  )
}

export async function getServerData() {
  return {
    props: data.ssr.serverData,
  }
}

export function Head({ serverData }) {
  const { base, title, meta, noscript, style, link } = data.ssr

  return (
    <>
      <base data-testid="base" href={base} />
      <title data-testid="title">{title}</title>
      <meta data-testid="meta" name="author" content={meta} />
      <noscript data-testid="noscript">{noscript}</noscript>
      <style data-testid="style">
        {`
          h1 {
            color: ${style};
          }
        `}
      </style>
      <link data-testid="link" href={link} rel="stylesheet" />
      <meta
        data-testid="server-data"
        name="server-data"
        content={JSON.stringify(serverData)}
      />
    </>
  )
}
