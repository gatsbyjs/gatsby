import { readFile, writeFile, ensureDir } from "fs-extra"
import path from "path"
import { JSDOM } from "jsdom"
import sharp from "sharp"
import pixelmatch from "pixelmatch"
import { PNG } from "pngjs"

type ImgData = { metadata: sharp.Metadata; data: Buffer }

async function toImageBuffer(imagePath: string): Promise<ImgData> {
  const filename = path.join(__dirname, "..", "public", imagePath)
  const pipeline = sharp(filename)
  const metadata = await pipeline.metadata()
  const data = await pipeline.ensureAlpha().raw().toBuffer()
  return { metadata, data }
}

function parseSrcSet(srcset: string): Array<{ src: string; size: number }> {
  return srcset.split(",").map(item => {
    const [src, size] = item.split(" ")
    return { src, size: parseInt(size) }
  })
}

type Source = {
  format: string
  srcset: Array<{ src: string; size: number }>
}

function getImages(testId: string, dom: HTMLDivElement) {
  const node = dom.querySelector(`[data-test-id="${testId}"]`)

  const sources = node?.querySelectorAll("source")

  const img = node?.querySelector<HTMLImageElement>("[data-main-image]")

  const srcsets: Array<Source> = []
  const imgsrcset = img?.dataset.srcset

  if (imgsrcset) {
    srcsets.push({ format: "auto", srcset: parseSrcSet(imgsrcset) })
  }

  sources?.forEach(source => {
    const format = source.getAttribute("type")
    const srcset = source.getAttribute("srcset")
    if (format && srcset) {
      srcsets.push({ format, srcset: parseSrcSet(srcset) })
    }
  })
  return srcsets
}

async function imageDiff(source: ImgData, target: string): Promise<boolean> {
  const targetData = await toImageBuffer(target)
  const { metadata, data } = targetData

  if (
    metadata.width !== source.metadata.width ||
    metadata.height !== source.metadata.height
  ) {
    console.warn("Image sizes don't match")
    return false
  }

  const diffImg = new PNG(metadata)

  const diff = pixelmatch(
    data,
    source.data,
    diffImg.data,
    metadata.width,
    metadata.height,
    { threshold: 0.2 }
  )

  const pass = diff < data.length / 4 / 100 //1% change

  if (!pass) {
    const name = `${expect.getState().currentTestName} ${path.basename(
      target
    )} ${source.metadata.width}x${source.metadata.height}`.replace(/\W+/g, "_")

    await ensureDir("__diff_output")
    await writeFile(`__diff_output/${name}.png`, PNG.sync.write(diffImg))
  }

  return pass
}

async function loadHTML(pathName): Promise<HTMLDivElement> {
  const html = await readFile(
    path.resolve(__dirname, "..", "public", pathName),
    "utf-8"
  )
  return new JSDOM(html).window.document.getElementById("___gatsby")
}

async function compareSrcSets(
  main: Source,
  other: Source
): Promise<Array<[string, boolean]>> {
  const results = await Promise.all(
    main.srcset.map(
      async ({ src, size }, index): Promise<[string, boolean]> => {
        const title = `${path.basename(src)} does not match ${path.basename(
          other.srcset[index].src
        )} at size ${size}`
        const source = await toImageBuffer(src)
        const result = await imageDiff(source, other.srcset[index].src)
        return [title, result]
      }
    )
  )
  return results.filter(([title, result]) => !result)
}

declare global {
  namespace jest {
    interface VisualMatch extends JestMatchers<Source> {
      toVisuallyMatchSrcSet: (
        comparison: Source
      ) => Promise<jest.CustomMatcherResult>
    }
  }
}

expect.extend({
  toVisuallyMatchSrcSet: async (received: Source, comparison: Source) => {
    const results = await compareSrcSets(comparison, received)
    if (!results.length) {
      return {
        pass: true,
        message: () =>
          `expected ${received.format} srcset to not match ${comparison.format}`,
      }
    }
    return {
      pass: false,
      message: () =>
        `expected ${received.format} srcset to match ${
          comparison.format
        }: \n${results.map(([title]) => title).join("\n")} `,
    }
  },
})

describe("image snapshots", () => {
  it("generates an image", async () => {
    const div = await loadHTML("index.html")

    const [fallback, ...imgs] = getImages("constrained", div)

    await Promise.all(
      imgs.map(img => {
        return (expect(img) as jest.VisualMatch).toVisuallyMatchSrcSet(fallback)
      })
    )
  })
})
