import { Span } from "opentracing"
import webpackConfig from "../utils/webpack.config"
import { build } from "../utils/webpack/bundle"
import type { IProgram } from "./types"

export const buildProductionBundle = async (
  program: IProgram,
  parentSpan: Span
): Promise<ReturnType<typeof build>> => {
  const { directory } = program

  const compilerConfig = await webpackConfig(
    program,
    directory,
    `build-javascript`,
    null,
    { parentSpan }
  )

  return build(compilerConfig)
}
