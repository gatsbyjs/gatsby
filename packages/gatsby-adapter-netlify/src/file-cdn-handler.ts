import type { RemoteFileAllowedUrls } from "gatsby"

import { cwd } from "node:process"
import { ensureDir } from "fs-extra"
import { join } from "node:path"
import { writeFileSync } from "node:fs"

import { generator } from "./generator"

export async function prepareFileCdnHandler({
  pathPrefix,
  remoteFileAllowedUrls,
}: {
  pathPrefix: string
  remoteFileAllowedUrls: RemoteFileAllowedUrls
}): Promise<void> {
  const frameworksApiEdgeFunctionsDir = join(
    cwd(),
    `.netlify`,
    `v1`,
    `edge-functions`
  )

  await ensureDir(frameworksApiEdgeFunctionsDir)

  const handlerSource = /* javascript */ `const allowedUrlPatterns = [${remoteFileAllowedUrls.map(
    allowedUrl => `new RegExp(\`${allowedUrl.regexSource}\`)`
  )}]

export default async function(_, context) {
  const remoteUrl = context.url.searchParams.get("url")
  const isAllowed = allowedUrlPatterns.some(allowedUrlPattern => allowedUrlPattern.test(remoteUrl))

  if (isAllowed) {
    return fetch(remoteUrl)
  } else {
    console.error(\`URL not allowed: \${remoteUrl}\`)

    return new Response("Bad request", {
      status: 500
    })
  }
}

export const config = {
  generator: "${generator}",
  name: "Gatsby File CDN",
  path: "${pathPrefix}/_gatsby/file/*",
}
`

  writeFileSync(
    join(frameworksApiEdgeFunctionsDir, `file-cdn-handler.mjs`),
    handlerSource
  )
}
