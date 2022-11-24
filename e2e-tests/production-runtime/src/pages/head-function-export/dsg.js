import * as React from "react"
import { data } from "../../../shared-data/head-function-export"

export default function HeadFunctionExportDSG() {
  return <h1>I test the Head function export in a DSG page</h1>
}

export async function config() {
  return () => {
    return {
      defer: true,
    }
  }
}

export function Head() {
  const { base, title, meta, noscript, style, link } = data.dsg

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
    </>
  )
}
