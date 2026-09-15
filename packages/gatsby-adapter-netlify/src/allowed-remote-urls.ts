import fs from "fs-extra"
import * as path from "path"

import type { RemoteFileAllowedUrls } from "gatsby"

export async function handleAllowedRemoteUrlsNetlifyConfig({
  remoteFileAllowedUrls,
}: {
  remoteFileAllowedUrls: RemoteFileAllowedUrls
}): Promise<void> {
  await fs.outputJSON(
    path.join(process.cwd(), `.netlify`, `v1`, `config.json`),
    {
      images: {
        remote_images: remoteFileAllowedUrls.map(
          allowedUrl => allowedUrl.regexSource
        ),
      },
    }
  )
}
