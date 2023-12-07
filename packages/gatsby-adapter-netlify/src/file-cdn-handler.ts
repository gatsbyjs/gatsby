import fs from "fs-extra"
import * as path from "path"

import packageJson from "gatsby-adapter-netlify/package.json"

export interface IFunctionManifest {
  version: 1
  functions: Array<
    | {
        function: string
        name?: string
        path: string
        cache?: "manual"
        generator: string
      }
    | {
        function: string
        name?: string
        pattern: string
        cache?: "manual"
        generator: string
      }
  >
  layers?: Array<{ name: `https://${string}/mod.ts`; flag: string }>
  import_map?: string
}

export async function prepareFileCdnHandler({
  pathPrefix,
  remoteFileAllowedUrlRegexes,
}: {
  pathPrefix: string
  remoteFileAllowedUrlRegexes: Array<string>
}): Promise<void> {
  const functionId = `file-cdn`

  const edgeFunctionsManifestPath = path.join(
    process.cwd(),
    `.netlify`,
    `edge-functions`,
    `manifest.json`
  )

  const fileCdnEdgeFunction = path.join(
    process.cwd(),
    `.netlify`,
    `edge-functions`,
    `${functionId}`,
    `${functionId}.mts`
  )

  const handlerSource = /* typescript */ `
    const allowedUrlPatterns = [${remoteFileAllowedUrlRegexes.map(
      regexSource => `new RegExp(\`${regexSource}\`)`
    )}]

    export default async (req: Request): Promise<Response> => {
      const url = new URL(req.url)
      const remoteUrl = url.searchParams.get("url")
      
      const isAllowed = allowedUrlPatterns.some(allowedUrlPattern => allowedUrlPattern.test(remoteUrl))
      if (isAllowed) {
        return fetch(remoteUrl);
      } else {
        console.error(\`URL not allowed: \${remoteUrl}\`)
        return new Response("Bad request", { status: 500 })
      }
    }
  `

  await fs.outputFileSync(fileCdnEdgeFunction, handlerSource)

  const manifest: IFunctionManifest = {
    functions: [
      {
        path: `${pathPrefix}/_gatsby/file/*`,
        function: functionId,
        generator: `gatsby-adapter-netlify@${
          packageJson?.version ?? `unknown`
        }`,
      },
    ],
    layers: [],
    version: 1,
  }

  await fs.outputJSON(edgeFunctionsManifestPath, manifest)
}
