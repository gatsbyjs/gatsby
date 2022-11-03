import path from "path"
import { fetchRemoteFile } from "gatsby-core-utils/fetch-remote-file"
import { cpuCoreCount } from "gatsby-core-utils/cpu-core-count"
import Queue from "fastq"
import { transformImage } from "../transform-images"

interface IImageServiceProps {
  outputDir: Parameters<typeof transformImage>[0]["outputDir"]
  args: Parameters<typeof transformImage>[0]["args"] & {
    contentDigest: string
  }
}

const queue = Queue<null, IImageServiceProps, string>(
  async function transform(task, cb): Promise<void> {
    try {
      return void cb(null, await transformImage(task))
    } catch (e) {
      return void cb(e)
    }
  },
  // When inside query workers, we only want to use the current core
  process.env.GATSBY_WORKER_POOL_WORKER ? 1 : Math.max(1, cpuCoreCount() - 1)
)

// eslint-disable-next-line @typescript-eslint/naming-convention
export async function FILE_CDN({
  outputDir,
  args: { url, filename, contentDigest, httpHeaders },
}: {
  outputDir: string
  args: {
    url: string
    filename: string
    contentDigest: string
    httpHeaders: Record<string, string>
  }
}): Promise<void> {
  const ext = path.extname(filename)

  await fetchRemoteFile({
    directory: outputDir,
    url,
    name: path.basename(filename, ext),
    ext,
    cacheKey: contentDigest,
    excludeDigest: true,
    httpHeaders,
  })
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export async function IMAGE_CDN(args: {
  outputDir: Parameters<typeof transformImage>[0]["outputDir"]
  args: Parameters<typeof transformImage>[0]["args"] & {
    contentDigest: string
  }
}): Promise<void> {
  return new Promise((resolve, reject) => {
    queue.push(args, err => {
      if (err) {
        reject(err)
        return
      }

      resolve()
    })
  })
}
