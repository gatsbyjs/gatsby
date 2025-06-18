/* eslint-disable @babel/no-invalid-this */

import { LoaderDefinitionFunction } from "webpack"

export interface ISharpBundlingPatchOptions {
  sharpPlatformAndArch: string
}

const webpackPatchSharp: LoaderDefinitionFunction<ISharpBundlingPatchOptions> =
  function webpackPatchSharp(source: string): string {
    if (source && this?.resourcePath?.endsWith(`/lib/sharp.js`)) {
      // ref https://github.com/lovell/sharp/issues/4380
      source = source
        .replace(
          `sharp = require(path)`,
          `sharp = require('@img/sharp-${
            this.getOptions().sharpPlatformAndArch
          }/sharp.node')`
        )
        .replace(
          `const { config } = require(\`@img/sharp-libvips-\${runtimePlatform}/package\`)`,
          `throw new Error('will be caught and ignored'); const config = {};`
        )
    }

    if (source && this?.resourcePath?.endsWith(`/lib/utility.js`)) {
      source = source
        .replace(
          `versions = require(\`@img/sharp-\${runtimePlatform}/versions\`)`,
          ``
        )
        .replace(
          `versions = require(\`@img/sharp-libvips-\${runtimePlatform}/versions\`)`,
          ``
        )
    }

    if (source && this?.resourcePath?.endsWith(`/lib/libvips.js`)) {
      source = source
        .replace(
          `return require(\`@img/sharp-libvips-dev-\${buildPlatformArch()}/include\`)`,
          `throw new Error('will be caught and ignored');`
        )
        .replace(
          `return require(\`@img/sharp-libvips-dev-\${buildPlatformArch()}/lib\`)`,
          `throw new Error('will be caught and ignored');`
        )
        .replace(
          `return require(\`@img/sharp-libvips-\${buildPlatformArch()}/lib\`)`,
          `throw new Error('will be caught and ignored');`
        )
    }

    return source?.replace(
      `versions = require(\`../vendor/\${versions.vips}/\${platformAndArch}/versions.json\`);`,
      ``
    )
  }

export default webpackPatchSharp
