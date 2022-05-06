import * as path from "path"
import * as fs from "fs"

const parcelDir = path.join(process.cwd(), `.cache`, `parcel`)

export function getParcelFile(file: string) {
  return path.join(__dirname, `..`, `..`, `internal-plugins`, `parcel`, file)
}

export function getParcelConfig(key: string) {
  return getParcelFile(`${key}.parcelrc`)
}

export function createParcelConfig(name: string, config: any, settings?: any) {
  const configDir = path.join(parcelDir, name)
  fs.mkdirSync(configDir, { recursive: true });

  let rcPath = path.join(configDir, 'bundle.parcelrc')
  let pkgPath = path.join(configDir, 'bundle.config.json')

  // TODO merge nested properly
  // TODO come up with way to define before/after defaults
  const fullConfig = {
    ...config,
    bundler: "@parcel/bundler-default",
    transformers: {
      ...(config.transformers || []),  // this is after to let defaults handle things first
      "types:*.{ts,tsx}": [
        "@parcel/transformer-typescript-types",
      ],
      "bundle-text:*": [
        "...", 
        "@parcel/transformer-inline-string",
      ],
      "data-url:*": [
        "...", 
        "@parcel/transformer-inline-string",
      ],
      "worklet:*.{js,mjs,jsm,jsx,es6,cjs,ts,tsx}": [
        "@parcel/transformer-worklet",
        "...",
      ],
      "*.{js,mjs,jsm,jsx,es6,cjs,ts,tsx}": [
        "parcel-transformer-define",
        "parcel-transformer-remove-gatsby-internals",
        "@parcel/transformer-js",
        "@parcel/transformer-react-refresh-wrap",
      ],
      "*.{json,json5}": ["@parcel/transformer-json"],
      "*.jsonld": ["@parcel/transformer-jsonld"],
      "*.toml": ["@parcel/transformer-toml"],
      "*.webmanifest": ["@parcel/transformer-webmanifest"],
      "webmanifest:*.{json,webmanifest}": ["@parcel/transformer-webmanifest"],
      "*.{yaml,yml}": ["@parcel/transformer-yaml"],
      "*.{gql,graphql}": ["@parcel/transformer-graphql"],
      "*.mdx": ["@parcel/transformer-mdx"],
      "*.{xml,rss,atom}": ["@parcel/transformer-xml"],
      "url:*": ["...", "@parcel/transformer-raw"],
    },
    namers: [
      ...(config.namers || []),
      "@parcel/namer-default",
    ],
    runtimes: [
      ...(config.runtimes || []),
      "@parcel/runtime-js",
      "@parcel/runtime-browser-hmr",
      "@parcel/runtime-react-refresh",
      "@parcel/runtime-service-worker",
    ],
    optimizers: {
      ...(config.optimizers || []),
      "data-url:*": ["...", "@parcel/optimizer-data-url"],
      "*.{js,mjs,cjs}": ["@parcel/optimizer-terser"],
    },
    packagers: {
      ...(config.packagers || []),
      "*.{js,mjs,cjs}": "@parcel/packager-js",
      "*.{xml,rss,atom}": "@parcel/packager-xml",
      "*.ts": "@parcel/packager-ts",
      "*.{jsonld,svg,webmanifest}": "@parcel/packager-raw-url",
      "*": "@parcel/packager-raw",
    },
    compressors: {
      ...(config.compressors || []),
      "*": ["@parcel/compressor-raw"],
    },
    resolvers: [
      ...(config.resolvers || []),
      "@parcel/resolver-default",
      "parcel-resolver-require-resolve",
    ],
    reporters: [
      ...(config.reporters || []),
      "@parcel/reporter-dev-server",
    ],
  }

  fs.writeFileSync(rcPath, JSON.stringify(fullConfig, null, 2))

  const fullSettings = {
    name: path.basename(configDir),
    ...settings,
  }

  fs.writeFileSync(pkgPath, JSON.stringify(fullSettings, null, 2))
  
  // TODO this is bad, but it works for PoC
  // this is used in our custom plugins for dynamic values
  process.env.PARCEL_CONFIG_LOCATION = configDir

  return {
    rc: rcPath,
    cache: path.join(configDir, 'cache')
  }
}