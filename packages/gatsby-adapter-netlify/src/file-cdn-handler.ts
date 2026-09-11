import fs from "fs-extra"
import * as path from "path"

import type { RemoteFileAllowedUrls } from "gatsby"

import { generator } from "./generator"

export async function prepareFileCdnHandler({
  pathPrefix,
  remoteFileAllowedUrls,
}: {
  pathPrefix: string
  remoteFileAllowedUrls: RemoteFileAllowedUrls
}): Promise<void> {
  const fileCdnEdgeFunction = path.join(
    process.cwd(),
    `.netlify`,
    `v1`,
    `edge-functions`,
    `file-cdn-handler.mjs`
  )

  const handlerSource = /* javascript */ `const allowedUrlPatterns = [${remoteFileAllowedUrls.map(
    allowedUrl => `new RegExp(\`${allowedUrl.regexSource}\`)`
  )}]

export default async function (_, context) {
  const remoteUrl = context.url.searchParams.get("url")
  const isAllowed = allowedUrlPatterns.some(allowedUrlPattern => allowedUrlPattern.test(remoteUrl))

  if (isAllowed) {
    return fetch(remoteUrl)
  } else {
    console.error(\`URL not allowed: \${remoteUrl}\`)
    return new Response("Bad request", { status: 500 })
  }
}

export const config = {
  generator: "${generator}",
  name: "Gatsby File CDN",
  path: "${pathPrefix}/_gatsby/file/*",
}
`

  await fs.outputFile(fileCdnEdgeFunction, handlerSource)
}
