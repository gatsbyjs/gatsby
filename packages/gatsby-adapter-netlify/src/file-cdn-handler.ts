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
}: {
  pathPrefix: string
  remoteFileAllowedUrls: Array<string>
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
    import type { Context } from "@netlify/edge-functions"

    export default async (req: Request, context: Context): Promise<Response> => {
      const url = new URL(req.url)
      const remoteUrl = url.searchParams.get("url")

      // @todo: use allowed remote urls to decide wether request should be allowed
      // blocked by https://github.com/gatsbyjs/gatsby/pull/38719
      const isAllowed = true
      if (isAllowed) {
        console.log(\`URL allowed\`, { remoteUrl })
        return fetch(remoteUrl);
      } else {
        console.error(\`URL not allowed: \${remoteUrl}\`)
        return new Response("Not allowed", { status: 403 })
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
