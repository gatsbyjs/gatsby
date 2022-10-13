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
const useCoverage = !!process.env.GENERATE_JEST_REPORT

// list to add ESM to ignore
const esModules = [
  `rehype`,
  `unified`,
  `bail`,
  `is-plain-obj`,
  `@mdx-js/mdx`,
  `trough`,
  `vfile`,
  `unist-util-stringify-position`,
  `hast-util-from-parse5`,
  `hastscript`,
  `property-information`,
  `hast-util-parse-selector`,
  `space-separated-tokens`,
  `comma-separated-tokens`,
  `web-namespaces`,
  `hast-util-to-html`,
  `html-void-elements`,
  `hast-util-is-element`,
  `unist-util-is`,
  `hast-util-whitespace`,
  `stringify-entities`,
  `character-entities-legacy`,
  `character-entities-html4`,
  `ccount`,
  `remark-mdx`,
  `micromark-extension-mdxjs`,
  `micromark-util-combine-extensions`,
  `micromark-util-chunked`,
  `micromark-extension-mdx-expression`,
  `micromark-factory-mdx-expression`,
  `micromark-util-character`,
  `micromark-factory-space`,
  `unist-util-position-from-estree`,
  `micromark-util-events-to-acorn`,
  `estree-util-visit`,
  `micromark-extension-mdx-jsx`,
  `estree-util-is-identifier-name`,
  `micromark-extension-mdx-md`,
  `micromark-core-commonmark`,
  `micromark-util-classify-character`,
  `micromark-util-resolve-all`,
  `decode-named-character-reference`,
  `character-entities`,
  `micromark-util-subtokenize`,
  `micromark-factory-destination`,
  `micromark-util-character`,
  `micromark-factory-label`,
  `micromark-factory-title`,
  `micromark-factory-whitespace`,
  `micromark-util-normalize-identifier`,
  `micromark-util-html-tag-name`,
  `mdast-util-mdx`,
  `parse-entities`,
  `character-reference-invalid`,
  `is-decimal`,
  `is-hexadecimal`,
  `is-alphanumerical`,
  `is-alphabetical`,
  `mdast-util-to-markdown`,
  `remark-parse`,
  `mdast-util-from-markdown`,
  `mdast-util-to-string`,
  `micromark`,
  `remark-rehype`,
  `mdast-util-to-hast`,
  `unist-builder`,
  `unist-util-visit`,
  `unist-util-position`,
  `unist-util-generated`,
  `mdast-util-definitions`,
  `estree-util-build-jsx`,
  `mdast-util-toc`,
  `remark-stringify`,
  `remark-parse`,
  `zwitch`,
  `longest-streak`,
  `estree-walker`,
  `periscopic`,
  `hast-util-to-estree`,
  `estree-util-attach-comments`,
  `trim-lines`,
  `estree-util-to-js`,
].join(`|`)

module.exports = {
  notify: true,
  verbose: true,
  roots: pkgs,
  modulePathIgnorePatterns: ignoreDirs,
  coveragePathIgnorePatterns: ignoreDirs,
  testPathIgnorePatterns: [
    `<rootDir>/examples/`,
    `<rootDir>/dist/`,
    `<rootDir>/node_modules/`,
    `<rootDir>/packages/gatsby-admin/.cache/`,
    `<rootDir>/packages/gatsby-plugin-gatsby-cloud/src/__tests__/mocks/`,
    `<rootDir>/packages/gatsby/src/utils/worker/__tests__/test-helpers/`,
    `<rootDir>/deprecated-packages/`,
    `__tests__/fixtures`,
    `__testfixtures__/`,
  ],
  transformIgnorePatterns: [`/node_modules/(?!${esModules})`],
  transform: {
    "^.+\\.[jt]sx?$": `<rootDir>/jest-transformer.js`,
  },
  moduleNameMapper: {
    "^highlight.js$": `<rootDir>/node_modules/highlight.js/lib/index.js`,
    "^@reach/router(.*)": `<rootDir>/node_modules/@gatsbyjs/reach-router$1`,
    "^weak-lru-cache$": `<rootDir>/node_modules/weak-lru-cache/dist/index.cjs`,
    "^ordered-binary$": `<rootDir>/node_modules/ordered-binary/dist/index.cjs`,
    "^msgpackr$": `<rootDir>/node_modules/msgpackr/dist/node.cjs`,
    "^gatsby-page-utils/(.*)$": `gatsby-page-utils/dist/$1`, // Workaround for https://github.com/facebook/jest/issues/9771
    "^gatsby-core-utils/(.*)$": `gatsby-core-utils/dist/$1`, // Workaround for https://github.com/facebook/jest/issues/9771
    "^gatsby-plugin-utils/(.*)$": [
      `gatsby-plugin-utils/dist/$1`,
      `gatsby-plugin-utils/$1`,
    ], // Workaround for https://github.com/facebook/jest/issues/9771
    "^estree-walker$": `<rootDir>/node_modules/estree-walker/src/index.js`,
  },
  snapshotSerializers: [`jest-serializer-path`],
  collectCoverageFrom: coverageDirs,
  reporters: process.env.CI
    ? [[`jest-silent-reporter`, { useDots: true, showPaths: true }]].concat(
        useCoverage ? `jest-junit` : []
      )
    : [`default`].concat(useCoverage ? `jest-junit` : []),
  moduleFileExtensions: [`js`, `jsx`, `ts`, `tsx`, `json`],
  setupFiles: [`<rootDir>/.jestSetup.js`],
  setupFilesAfterEnv: [`jest-extended`],
  testEnvironment: `<rootDir>/jest.environment.ts`,
}
