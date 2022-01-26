import { createRequireFromPath } from "gatsby-core-utils"

export default function (source: string): string {
  let lmdbBinaryLocation
  try {
    const lmdbRequire = createRequireFromPath(require.resolve(`lmdb`))
    const nodeGypBuild = lmdbRequire(`node-gyp-build`)
    const path = require(`path`)

    lmdbBinaryLocation = nodeGypBuild.path(
      path.dirname(require.resolve(`lmdb`)).replace(`/dist`, ``)
    )
  } catch (e) {
    console.error(`ln`, e)
    return source
  }

  return source
    .replace(
      `require$1('node-gyp-build')(dirName)`,
      `require(${JSON.stringify(lmdbBinaryLocation)})`
    )
    .replace(
      `require$2.resolve('./dict/dict.txt')`,
      `require.resolve('../dict/dict.txt')`
    )
    .replace(
      /fs\.readFileSync\(new URL\('\.\/dict\/dict\.txt',\s*\(typeof\s*document\s*===\s*'undefined'\s*\?\s*new\s*\(require\('u'\s*\+\s*'rl'\)\.URL\)\s*\('file:'\s*\+\s*__filename\).href\s*:\s*\(document\.currentScript\s*&&\s*document\.currentScript\.src\s*\|\|\s*new URL\('index\.cjs',\s*document\.baseURI\)\.href\)\)\.replace\(\/dist\[\\\\\\\/\]index\.cjs\$\/,\s*''\)\)\)/g,
      `fs.readFileSync(require.resolve('../dict/dict.txt'))`
    )
}
