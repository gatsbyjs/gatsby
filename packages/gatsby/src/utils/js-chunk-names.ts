import memoize from "memoizee"
import { kebabCase as _kebabCase } from "lodash"
import { murmurhash as _murmurhash } from "babel-plugin-remove-graphql-queries/murmur"
import path from "path"
import { store } from "../redux"
import { getPathToContentComponent } from "gatsby-core-utils/parse-component-path"

const kebabCase = memoize(_kebabCase)
const pathRelative = memoize(path.relative)
const murmurhash = memoize(_murmurhash)

// unified routes adds support for files with [] and {},
// the problem with our generateComponentChunkName is that when you
// call kebabCase, is strips off characters like that. This means
// that when you have a app with this sort of setup, the resolutions fail
//
// src/pages/products/{id}.js (collection route)
// src/pages/products/[...id].js (should render when a non-matched id is passed in)
//
// without this function, what happens is that all visits to /products/__ resolve to only one
// of these because the componentChunkName ends up being duplicate. This function ensures that
// the {} and [] are kept in the componentChunkName. Also there are tests for this.
function replaceUnifiedRoutesKeys(
  kebabedName: string,
  filePath: string
): string {
  let newString = kebabedName

  filePath.split(path.sep).forEach(part => {
    if (part[0] === `[` || part[0] === `{`) {
      const match = /(\[(.*)\]|\{(.*)\})/.exec(part)
      newString = newString.replace(
        `-${match![2] || match![3]}-`,
        `-${match![0]}-`
      )
    }
  })

  return newString
}

const chunkNameCache = new Map()
export function generateComponentChunkName(componentPath: string): string {
  if (chunkNameCache.has(componentPath)) {
    return chunkNameCache.get(componentPath)
  } else {
    const { program } = store.getState()
    const directory = program?.directory || `/`
    let name = pathRelative(directory, componentPath)

    /**
     * To prevent long file name errors, we truncate the name to a maximum of 60 characters.
     */
    const hash = murmurhash(name)
    name = `${hash}-${name.substring(name.length - 60)}`

    const chunkName = `component---${replaceUnifiedRoutesKeys(
      kebabCase(name),
      name
    )}`

    chunkNameCache.set(componentPath, chunkName)

    return chunkName
  }
}
