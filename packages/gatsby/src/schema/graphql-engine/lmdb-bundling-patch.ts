import { createRequireFromPath } from "gatsby-core-utils"

// This is hacky webpack loader that does string replacements to
// allow lmdb@2 to be bundled by webpack for engines.
// Currently `@vercel/webpack-asset-relocator-loader doesn't handle
// the way lmdb is loading binaries and dictionary file
// (can't statically analyze it). So we perform few localized changes
// and we replace dynamic values with hardcoded ones to allow
// asset-relocator to pick those assets up and handle them.
//
// Because lmdb code can diverge, we also pin version in gatsby
// dependencies and will have manually bump it (with renovate most likely).
//
// To solve this upstream few things would need to change:
//  - https://github.com/DoctorEvidence/lmdb-js/blob/544b3fda402f24a70a0e946921e4c9134c5adf85/node-index.js#L14-L16
//  - https://github.com/DoctorEvidence/lmdb-js/blob/544b3fda402f24a70a0e946921e4c9134c5adf85/open.js#L77
// Reliance on `import.meta.url` + usage of `.replace` is what seems to cause problems currently.

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
