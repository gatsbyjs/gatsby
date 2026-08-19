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
    // sharp 0.33+ picks its native binary by building an array of candidate paths (mixing
    // literal strings and template literals) and `require()`-ing a loop variable bound to each
    // in turn. `@vercel/webpack-asset-relocator-loader` can only discover/copy an asset when the
    // require's argument is directly a literal or template literal at the call site - a require
    // of a variable populated via array iteration is "too dynamic" and gets left as a plain
    // runtime-only require, which can't resolve `@img/sharp-*` from the bundle's own location.
    // Replace the whole dynamic lookup with a single direct `require("literal")` call for the
    // platform we're actually bundling for, which the relocator can trivially analyze and copy.
    const dynamicRequireBlock = `const paths = [
  \`../src/build/Release/sharp-\${runtimePlatform}.node\`,
  '../src/build/Release/sharp-wasm32.node',
  \`@img/sharp-\${runtimePlatform}/sharp.node\`,
  '@img/sharp-wasm32/sharp.node'
];

let sharp;
const errors = [];
for (const path of paths) {
  try {
    sharp = require(path);
    break;
  } catch (err) {
    /* istanbul ignore next */
    errors.push(err);
  }
}`

    const staticRequireBlock = `let sharp;
const errors = [];
try {
  sharp = require(${JSON.stringify(
    `@img/sharp-${forcedRuntimePlatform}/sharp.node`
  )});
} catch (err) {
  errors.push(err);
}`

    if (patched?.includes(dynamicRequireBlock)) {
      patched = patched.replace(dynamicRequireBlock, staticRequireBlock)
    }
  }

  return patched
}
