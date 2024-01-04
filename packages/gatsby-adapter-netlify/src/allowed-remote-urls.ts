import type { Reporter, RemoteFileAllowedUrls } from "gatsby"

export async function handleAllowedRemoteUrlsNetlifyConfig({
  remoteFileAllowedUrls,
  reporter,
}: {
  remoteFileAllowedUrls: RemoteFileAllowedUrls
  reporter: Reporter
}): Promise<void> {
  const { resolveConfig } = await import(`@netlify/config`)
  const cfg = await resolveConfig()

  if (cfg?.config) {
    const allowedUrlsInNetlifyToml: Array<string> =
      cfg.config.images?.remote_images ?? []

    const allowedUrlsInNetlifyTomlRegexes = allowedUrlsInNetlifyToml.map(
      regexSource => new RegExp(regexSource)
    )

    const missingAllowedUrlsInNetlifyToml: Array<string> = []
    for (const remoteFileAllowedUrl of remoteFileAllowedUrls) {
      // test if url pattern already passes one of the regexes in netlify.toml
      const isAlreadyAllowed = allowedUrlsInNetlifyTomlRegexes.some(
        allowedRegex => allowedRegex.test(remoteFileAllowedUrl.urlPattern)
      )

      if (!isAlreadyAllowed) {
        missingAllowedUrlsInNetlifyToml.push(remoteFileAllowedUrl.regexSource)
      }
    }

    if (missingAllowedUrlsInNetlifyToml.length > 0) {
      const entriesToAddToToml = `${missingAllowedUrlsInNetlifyToml
        .map(
          missingAllowedUrlInNetlifyToml =>
            `  ${JSON.stringify(missingAllowedUrlInNetlifyToml)}`
        )
        .join(`,\n`)},\n`

      if (typeof cfg.config.images?.remote_images === `undefined`) {
        reporter.warn(
          `Missing allowed URLs in your Netlify configuration. Add following to your netlify.toml:\n\`\`\`toml\n[images]\nremote_images = [\n${entriesToAddToToml}]\n\`\`\``
        )
      } else {
        reporter.warn(
          `Missing allowed URLs in your Netlify configuration. Add following entries to your existing \`images.remote_images\` configuration in netlify.toml:\n\`\`\`toml\n${entriesToAddToToml}\`\`\``
        )
      }
    }
  } else {
    reporter.verbose(`[gatsby-adapter-netlify] no netlify.toml found`)
  }
}
