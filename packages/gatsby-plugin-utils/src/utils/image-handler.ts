import { writeFile } from "fs-extra"
import getSharpInstance from "gatsby-sharp"
import reporter from "gatsby/reporter"

interface IResizeArgs {
  width: number
  height: number
  format: string
  outputPath?: string
}

// Lots of work to get the sharp instance
type Pipeline = ReturnType<Awaited<ReturnType<typeof getSharpInstance>>>

async function transformImage(
  pipeline: Pipeline | Buffer,
  { width, height, format, outputPath }: IResizeArgs
): Promise<Buffer | void> {
  if (pipeline instanceof Buffer) {
    if (!outputPath) {
      return pipeline
    }

    return writeFile(outputPath, pipeline)
  }

  const resizedImage = pipeline
    .resize(width, height, {})
    .toFormat(
      format as unknown as keyof Awaited<
        ReturnType<typeof getSharpInstance>
      >["format"]
    )

  if (outputPath) {
    await writeFile(outputPath, await resizedImage.toBuffer())
    return undefined
  } else {
    return await resizedImage.toBuffer()
  }
}

export async function resize(
  buffer: Buffer,
  transforms: IResizeArgs | Array<IResizeArgs>
): Promise<Buffer | void | Array<Buffer | void>> {
  let sharp
  try {
    sharp = await getSharpInstance()
  } catch (err) {
    reporter.panicOnBuild(`There was an issue install sharp.`, err)
  }

  let pipeline: Pipeline | undefined
  if (sharp) {
    pipeline = sharp(buffer)
  }

  if (Array.isArray(transforms)) {
    const results: Array<Buffer | void> = []
    for (const transform of transforms) {
      results.push(await transformImage(pipeline ?? buffer, transform))
    }

    return results
  } else {
    return transformImage(pipeline ?? buffer, transforms)
  }
}
