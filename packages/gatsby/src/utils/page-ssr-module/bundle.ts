import * as path from "path"
const rollup = require(`rollup`)
import replace from "@rollup/plugin-replace"
import { store } from "../../redux"
import commonjs from "@rollup/plugin-commonjs"
import resolve from "@rollup/plugin-node-resolve"

import type { ITemplateDetails } from "./entry"

import {
  getScriptsAndStylesForTemplate,
  readWebpackStats,
} from "../client-assets-for-template"

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
    toInline[pageTemplate.componentChunkName] = {
      query: pageTemplate.query,
      staticQueryHashes:
        store
          .getState()
          .staticQueriesByTemplate.get(pageTemplate.componentPath) || [],
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
    ],
    external: [`./render-page`],
  }

  const bundle = await rollup.rollup(inputOptions)
  const { output } = await bundle.write(outputOptions)

  console.log({
    imports: output[0].imports,
  })
}
