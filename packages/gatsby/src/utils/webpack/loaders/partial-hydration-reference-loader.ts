/* eslint-disable @babel/no-invalid-this */

import { LoaderDefinitionFunction } from "webpack"
import url from "url"

const partialHydrationReferenceLoader: LoaderDefinitionFunction<
  Record<string, unknown>
> = async function partialHydrationReferenceLoader(content) {
  // TODO make this check more robust, using acorn ast check
  if (!content.includes(`"client export"`)) {
    return content
  }

  const moduleId = url
    .pathToFileURL(this.resourcePath)
    .href.replace(this.rootContext.replace(/\\/g, `/`), ``)
    .replace(`file:////`, `file://`)

  const source: Array<string> = []
  // capture  CJS exports
  const cjsExports = content.matchAll(/exports\.([^ ]+)/g)
  for (const match of cjsExports) {
    source.push(`export const ${match[1]} = {
      $$typeof: MODULE_REFERENCE,
      filepath: '${moduleId}',
      name: '${match[1]}'
    }`)
  }

  // capture ESM exports
  const esmExports = content.matchAll(
    /export (const|let|var|function) ([^ ]+)/g
  )
  for (const match of esmExports) {
    source.push(`export const ${match[2]} = {
      $$typeof: Symbol.for('react.module.reference'),
      filepath: '${moduleId}',
      name: '${match[2]}'
    }`)
  }

  return source.join(`\n`)
}

module.exports = partialHydrationReferenceLoader
