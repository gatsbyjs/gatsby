import { Node, GatsbyCache, Reporter } from "gatsby"
import { traceSVG } from "gatsby-plugin-sharp"
import { SharpProps } from "../utils"

/**
 * By default the gatsby-plugin-sharp functions don't create SVG
 * images. This function adds them if needed.
 */

export async function getCustomSharpFields({
  file,
  args,
  reporter,
  cache,
}: {
  file: Node
  args: SharpProps
  reporter: Reporter
  cache: GatsbyCache
}): Promise<{
  tracedSVG?: string
}> {
  const { tracedSVG: createTracedSVG } = args

  let tracedSVG: string | undefined

  if (createTracedSVG) {
    tracedSVG = await traceSVG({
      file,
      args: { ...args, traceSVG: true },
      fileArgs: args,
      cache,
      reporter,
    })
  }

  return { tracedSVG }
}
