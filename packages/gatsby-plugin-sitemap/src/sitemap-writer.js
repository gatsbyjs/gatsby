import { SitemapAndIndexStream, SitemapStream } from "sitemap"
import { createWriteStream } from "fs"
import { resolve } from "path"
import { Readable, pipeline as pline } from "stream"
import { promisify } from "util"

const pipeline = promisify(pline)

export const writeSitemapAndIndex = ({
  hostname,
  sitemapHostname = hostname,
  sourceData,
  destinationDir,
  limit = 50000,
}) => {
  const sitemapAndIndexStream = new SitemapAndIndexStream({
    limit,
    getSitemapStream: i => {
      const sitemapStream = new SitemapStream({
        hostname,
      })
      const path = `./sitemap-${i}.xml`

      sitemapStream.pipe(createWriteStream(resolve(destinationDir, path))) // write it to sitemap-NUMBER.xml

      return [new URL(path, sitemapHostname).toString(), sitemapStream]
    },
  })
  const src = Readable.from(sourceData)

  return pipeline(
    src,
    sitemapAndIndexStream,
    createWriteStream(resolve(destinationDir, `./sitemap-index.xml`))
  )
}
