const path = require(`path`)
const glob = require(`glob`)
const fs = require(`fs`)

const pkgs = glob.sync(`./packages/*`).map(p => p.replace(/^\./, `<rootDir>`))

const reGatsby = /gatsby$/
const gatsbyDir = pkgs.find(p => reGatsby.exec(p))
const gatsbyBuildDirs = [`dist`].map(dir => path.join(gatsbyDir, dir))
const builtTestsDirs = pkgs
  .filter(p => fs.existsSync(path.join(p, `src`)))
  .map(p => path.join(p, `__tests__`))
const distDirs = pkgs.map(p => path.join(p, `dist`))
const ignoreDirs = [`<rootDir>/packages/gatsby-dev-cli/verdaccio`].concat(
  gatsbyBuildDirs,
  builtTestsDirs,
  distDirs
)

const coverageDirs = pkgs.map(p => path.join(p, `src/**/*.js`))
const useJestUnit = !!process.env.GENERATE_JEST_REPORT

// list to add ESM to ignore
const esModules = [
  `@mdx-js/mdx`,
  `@sindresorhus/is`,
  `@szmarczak/http-timer`,
  `aggregate-error`,
  `bail`,
  `cacheable-lookup`,
  `cacheable-request`,
  `ccount`,
  `character-entities`,
  `character-entities-html4`,
  `character-entities-legacy`,
  `character-reference-invalid`,
  `clean-stack`,
  `comma-separated-tokens`,
  `decode-named-character-reference`,
  `escape-string-regexp`,
  // The MDX/unified toolchain pulls in a lot of small ESM-only helpers. Match
  // the package families directly so the pnpm layout doesn't turn this into an
  // ever-growing one-package-at-a-time allowlist.
  `estree-util(?:-[^/]+)+`,
  `estree-util-attach-comments`,
  `estree-util-build-jsx`,
  `estree-util-is-identifier-name`,
  `estree-util-to-js`,
  `estree-util-visit`,
  `estree-walker`,
  `form-data-encoder`,
  `github-slugger`,
  `got`,
  `hast-util(?:-[^/]+)+`,
  `hast-util-from-parse5`,
  `hast-util-is-element`,
  `hast-util-parse-selector`,
  `hast-util-to-estree`,
  `hast-util-to-html`,
  `hast-util-whitespace`,
  `hastscript`,
  `html-void-elements`,
  `indent-string`,
  `is-alphabetical`,
  `is-alphanumerical`,
  `is-decimal`,
  `is-hexadecimal`,
  `is-online`,
  `is-plain-obj`,
  `is-reference`,
  `longest-streak`,
  `lowercase-keys`,
  `mdast-util(?:-[^/]+)+`,
  `mdast-util-definitions`,
  `mdast-util-from-markdown`,
  `mdast-util-mdx`,
  `mdast-util-mdx-jsx`,
  `mdast-util-mdx-expression`,
  `mdast-util-mdxjs-esm`,
  `mdast-util-phrasing`,
  `mdast-util-to-hast`,
  `mdast-util-to-markdown`,
  `mdast-util-to-string`,
  `mdast-util-toc`,
  `micromark(?:-[^/]+)+`,
  `micromark`,
  `micromark-core-commonmark`,
  `micromark-extension-mdx-expression`,
  `micromark-extension-mdx-jsx`,
  `micromark-extension-mdx-md`,
  `micromark-extension-mdxjs`,
  `micromark-extension-mdxjs-esm`,
  `micromark-factory-destination`,
  `micromark-factory-label`,
  `micromark-factory-mdx-expression`,
  `micromark-factory-space`,
  `micromark-factory-title`,
  `micromark-factory-whitespace`,
  `micromark-util-character`,
  `micromark-util-character`,
  `micromark-util-chunked`,
  `micromark-util-classify-character`,
  `micromark-util-combine-extensions`,
  `micromark-util-events-to-acorn`,
  `micromark-util-html-tag-name`,
  `micromark-util-normalize-identifier`,
  `micromark-util-resolve-all`,
  `micromark-util-subtokenize`,
  `mimic-response`,
  `normalize-url`,
  `node-releases`,
  `p-any`,
  `p-cancelable`,
  `p-some`,
  `p-timeout`,
  `parse-entities`,
  `periscopic`,
  `property-information`,
  `public-ip`,
  `rehype`,
  `remark-mdx`,
  `remark-parse`,
  `remark-parse`,
  `remark-rehype`,
  `remark-stringify`,
  `responselike`,
  `space-separated-tokens`,
  `stringify-entities`,
  `trim-lines`,
  `trough`,
  `unified`,
  `unist-builder`,
  `unist-util(?:-[^/]+)+`,
  `unist-util-generated`,
  `unist-util-is`,
  `unist-util-position`,
  `unist-util-position-from-estree`,
  `unist-util-stringify-position`,
  `unist-util-visit`,
  `vfile(?:-[^/]+)?`,
  `vfile`,
  `vfile-location`,
  `vfile-message`,
  `web-namespaces`,
  `zwitch`,
].join(`|`)
const esModulesWithPnpmStore = `/node_modules/(?!(?:\\.pnpm/[^/]+/node_modules/)?(?:${esModules})(?:/|$))`

/** @type {import('jest').Config} */
const config = {
  snapshotFormat: {
    escapeString: true,
    printBasicPrototype: true,
  },
  notify: true,
  verbose: true,
  roots: pkgs,
  modulePathIgnorePatterns: ignoreDirs,
  coveragePathIgnorePatterns: ignoreDirs,
  testPathIgnorePatterns: [
    `<rootDir>/examples/`,
    `<rootDir>/dist/`,
    `<rootDir>/node_modules/`,
    `<rootDir>/deprecated-packages/gatsby-plugin-gatsby-cloud/src/__tests__/mocks/`,
    `<rootDir>/packages/gatsby/src/utils/worker/__tests__/test-helpers/`,
    `<rootDir>/deprecated-packages/`,
    `__tests__/fixtures`,
    `__testfixtures__/`,
  ],
  transformIgnorePatterns: [
    // pnpm adds an extra `.pnpm/<store-entry>/node_modules/` hop before the
    // real package path, so Jest needs to look through that layer too.
    esModulesWithPnpmStore,
  ],
  transform: {
    "^.+\\.(jsx|js|mjs|ts|tsx)$": `<rootDir>/jest-transformer.js`,
  },
  moduleNameMapper: {
    "^highlight.js$": `<rootDir>/node_modules/highlight.js/lib/index.js`,
    "^@reach/router(.*)": `<rootDir>/node_modules/@gatsbyjs/reach-router$1`,
    "^weak-lru-cache$": `<rootDir>/node_modules/weak-lru-cache/dist/index.cjs`,
    "^ordered-binary$": `<rootDir>/node_modules/ordered-binary/dist/index.cjs`,
    "^msgpackr$": `<rootDir>/node_modules/msgpackr/dist/node.cjs`,
    "^estree-walker$": `<rootDir>/node_modules/estree-walker/src/index.js`,
    "^periscopic$": `<rootDir>/node_modules/periscopic/src/index.js`,
    "^is-reference$": `<rootDir>/node_modules/is-reference/dist/is-reference.es.js`,
  },
  snapshotSerializers: [`jest-serializer-path`],
  collectCoverageFrom: coverageDirs,
  reporters: process.env.CI
    ? [[`jest-silent-reporter`, { useDots: true, showPaths: true }]].concat(
        useJestUnit ? `jest-junit` : []
      )
    : [`default`].concat(useJestUnit ? `jest-junit` : []),
  moduleFileExtensions: [`js`, `jsx`, `ts`, `tsx`, `json`],
  setupFiles: [`<rootDir>/.jestSetup.js`],
  setupFilesAfterEnv: [`jest-extended/all`],
  testEnvironment: `<rootDir>/jest.environment.ts`,
}

module.exports = config
