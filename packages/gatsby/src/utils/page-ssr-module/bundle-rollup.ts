import * as path from "path"
const rollup = require(`rollup`)
import replace from "@rollup/plugin-replace"
import { store } from "../../redux"
import commonjs from "@rollup/plugin-commonjs"
import resolve from "@rollup/plugin-node-resolve"
import json from "@rollup/plugin-json"

import type { ITemplateDetails } from "./entry"

import {
  getScriptsAndStylesForTemplate,
  readWebpackStats,
} from "../client-assets-for-template"
import { writeStaticQueryContext } from "../static-query-utils"

const outputDir = path.join(process.cwd(), `.cache`, `page-ssr`)

const outputOptions = {
  file: path.join(outputDir, `index.js`),
  format: `cjs`,
}

export async function createPageSSRBundle(): Promise<any> {
  const { program, components } = store.getState()
  const webpackStats = await readWebpackStats(
    path.join(program.directory, `public`)
  )

  const toInline: Record<string, ITemplateDetails> = {}
  for (const pageTemplate of components.values()) {
    const staticQueryHashes =
      store
        .getState()
        .staticQueriesByTemplate.get(pageTemplate.componentPath) || []
    await writeStaticQueryContext(
      staticQueryHashes,
      pageTemplate.componentChunkName
    )

    toInline[pageTemplate.componentChunkName] = {
      query: pageTemplate.query,
      staticQueryHashes,
      assets: await getScriptsAndStylesForTemplate(
        pageTemplate.componentChunkName,
        webpackStats
      ),
    }
  }
  const inputOptions = {
    input: path.join(__dirname, `entry.js`),
    plugins: [
      replace({
        values: {
          INLINED_TEMPLATE_TO_DETAILS: JSON.stringify(toInline),
        },
      }),
      resolve(),
      commonjs(),
      json(),
    ],
    external: [`./render-page`],
  }

  const bundle = await rollup.rollup(inputOptions)
  await bundle.write(outputOptions)
}
