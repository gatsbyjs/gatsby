export async function handleAllowedRemoteUrls(
  remoteFileAllowedUrls: Array<string>
): Promise<void> {
  const { resolveConfig } = await import(`@netlify/config`)
  const cfg = await resolveConfig()

  const allowedUrlsInNetlifyToml: Array<string> =
    cfg?.config?.images?.remote_images ?? []

  const missingAllowedUrlsInNetlifyToml: Array<string> = []
  for (const remoteFileAllowedUrl of remoteFileAllowedUrls) {
    if (!allowedUrlsInNetlifyToml.includes(remoteFileAllowedUrl)) {
      missingAllowedUrlsInNetlifyToml.push(remoteFileAllowedUrl)
    }
  }

  console.log(`[dev log start] - will not be in merged code`)
  console.log({
    from_netlify_toml: cfg.config.images.remote_images,
    gatsby_generated: remoteFileAllowedUrls,
    missing_in_netlify_toml: missingAllowedUrlsInNetlifyToml,
  })
  console.log(`[dev log end] - will not be in merged code`)
}
