import { LoaderDefinitionFunction } from "webpack"

const webpackPatchSharp: LoaderDefinitionFunction = function webpackPatchSharp(
  source: string
): string {
  // eslint-disable-next-line @babel/no-invalid-this
  if (source && this?.resourcePath?.endsWith(`/lib/sharp.js`)) {
    // ref https://github.com/lovell/sharp/issues/4380
    source = source.replace(
      `sharp = require(path)`,
      // todo: this should not hardcode the platform specific package name
      // and instead figure out correct one for deployment platform
      `sharp = require('@img/sharp-linux-x64/sharp.node')`
    )
  }

  // eslint-disable-next-line @babel/no-invalid-this
  if (source && this?.resourcePath?.endsWith(`/lib/libvips.js`)) {
    source = source.replace(
      `require(\`@img/sharp-libvips-$\{buildPlatformArch()}/lib\`)`,
      // todo: this should not hardcode the platform specific package name
      // and instead figure out correct one for deployment platform
      `require(\`@img/sharp-libvips-linux-x64/lib\`)`
    )
  }

  return source?.replace(
    `versions = require(\`../vendor/\${versions.vips}/\${platformAndArch}/versions.json\`);`,
    ``
  )
}

export default webpackPatchSharp
