/* eslint-disable @babel/no-invalid-this */

import { LoaderDefinitionFunction } from "webpack"

export interface ISharpBundlingPatchOptions {
  sharpPlatformAndArch: string
}

const webpackPatchSharp: LoaderDefinitionFunction<ISharpBundlingPatchOptions> =
  function webpackPatchSharp(source: string): string {
    if (source && this?.resourcePath?.endsWith(`/lib/sharp.js`)) {
      // ref https://github.com/lovell/sharp/issues/4380
      source = source.replace(
        `sharp = require(path)`,
        `sharp = require('@img/${
          this.getOptions().sharpPlatformAndArch
        }/sharp.node')`
      )
    }

    // if (source && this?.resourcePath?.endsWith(`/lib/libvips.js`)) {
    //   source = source.replace(
    //     `require(\`@img/sharp-libvips-$\{buildPlatformArch()}/lib\`)`,
    //     // todo: this should not hardcode the platform specific package name
    //     // and instead figure out correct one for deployment platform
    //     `require(\`@img/sharp-libvips-linux-x64/lib\`)`
    //   )
    // }

    return source?.replace(
      `versions = require(\`../vendor/\${versions.vips}/\${platformAndArch}/versions.json\`);`,
      ``
    )
  }

export default webpackPatchSharp
