import { readFile } from "fs-extra"
import { fetchRemoteFile } from "gatsby-core-utils"
import { getCache as getFsCache } from "gatsby/dist/utils/get-cache"
import { resize } from "../../utils/image-handler"

const queue = new Map<
  string,
  {
    promise: Promise<void>
    transforms: Array<{
      width: number
      height: number
      format: string
      fit: string
      outputPath: string
    }>
  }
>()

let gatsbyCache
function getCache(): ReturnType<typeof getFsCache> {
  if (!gatsbyCache) {
    gatsbyCache = getFsCache(`gatsby`)
  }

  return gatsbyCache
}

function getCacheWithProxy(outputDir): ReturnType<typeof getFsCache> {
  return new Proxy(getCache(), {
    get: function (target, prop, receiver): unknown {
      if (prop === `directory`) {
        return outputDir
      }

      return Reflect.get(target, prop, receiver)
    },
  })
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export async function FILE_SERVICE({
  outputDir,
  args: { url, filename },
}: {
  outputDir: string
  args: { url: string; filename: string }
}): Promise<void> {
  await fetchRemoteFile({
    cache: getCacheWithProxy(outputDir),
    url: url,
    name: filename,
  })
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export async function IMAGE_SERVICE({
  outputDir,
  args: { url, filename, ...args },
}: {
  outputDir: string
  args: {
    url: string
    filename: string
    width: number
    height: number
    format: string
    fit: string
  }
}): Promise<void> {
  const filePath = await fetchRemoteFile({
    cache: getCache(),
    url: url,
    name: filename,
  })

  if (queue.has(url)) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const queued = queue.get(url)!
    queued.transforms.push({
      ...args,
      outputPath: `${outputDir}/${filename}`,
    })

    return queued.promise
  } else {
    const defer = new Promise<void>((resolve, reject) => {
      setImmediate(async () => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const transforms = queue.get(url)!.transforms
        queue.delete(url)

        resize(await readFile(filePath), transforms).then(
          () => resolve(),
          reject
        )
      })
    })

    queue.set(url, {
      promise: defer,
      transforms: [
        {
          ...args,
          outputPath: `${outputDir}/${filename}`,
        },
      ],
    })

    return defer
  }
}
