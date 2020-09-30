import { Node, GatsbyCache, Reporter } from "gatsby"
import { fluid, fixed, traceSVG } from "gatsby-plugin-sharp"

export async function getCustomSharpFields({
  isFixed, // make sure fluid is also handled
  file,
  args,
  reporter,
  cache,
}: {
  isFixed: boolean
  file: Node
  args: any // TODO type this correctly
  reporter: Reporter
  cache: GatsbyCache
}): Promise<{
  srcWebP: string | null
  srcSetWebP: string | null
  tracedSVG: string | null
}> {
  const { webP, tracedSVG } = args
  const customSharpFields = {
    srcWebP: null,
    srcSetWebP: null,
    tracedSVG: null,
  }

  if (webP) {
    // If the file is already in webp format or should explicitly
    // be converted to webp, we do not create additional webp files
    if (file.extension !== `webp`) {
      const fixedWebP = await fixed({
        file,
        args: { ...args, toFormat: `webp` },
        reporter,
        cache,
      })
      customSharpFields.srcWebP = fixedWebP.src
      customSharpFields.srcSetWebP = fixedWebP.srcSet
    }
  }

  if (tracedSVG) {
    const tracedSVG = await traceSVG({
      file,
      args: { ...args, traceSVG: true },
      fileArgs: args,
      cache,
      reporter,
    })
    customSharpFields.tracedSVG = tracedSVG
  }

  return customSharpFields
}
