/* eslint-disable @babel/no-invalid-this */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function (this: any, source: string): string {
  // sharp <0.33 vendored libvips per-version under its own package - this line doesn't exist
  // in sharp 0.33+, so the replace below is a no-op there (kept for older sharp versions)
  let patched = source?.replace(
    `versions = require(\`../vendor/\${versions.vips}/\${platformAndArch}/versions.json\`);`,
    ``
  )

  const forcedRuntimePlatform = this.getOptions()?.forcedRuntimePlatform
  if (forcedRuntimePlatform) {
    // sharp 0.33+ picks its native binary via `require(\`@img/sharp-${runtimePlatform}/sharp.node\`)`,
    // where `runtimePlatform` is computed at require-time from `process.platform`/`process.arch`/libc
    // detection. `@vercel/webpack-asset-relocator-loader` can't statically analyze a computed value,
    // so it never discovers or copies the actual .node binary into the bundle output. Hardcoding it
    // to the platform we're actually bundling for turns it back into a static, analyzable string.
    patched = patched?.replace(
      `const runtimePlatform = runtimePlatformArch();`,
      `const runtimePlatform = ${JSON.stringify(forcedRuntimePlatform)};`
    )
  }

  return patched
}
