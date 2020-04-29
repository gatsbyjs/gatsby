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

module.exports = {
  notify: true,
  verbose: true,
  roots: pkgs,
  modulePathIgnorePatterns: ignoreDirs,
  coveragePathIgnorePatterns: ignoreDirs,
  testPathIgnorePatterns: [
    `<rootDir>/examples/`,
    `<rootDir>/www/`,
    `<rootDir>/dist/`,
    `<rootDir>/node_modules/`,
    `__tests__/fixtures`,
  ],
  transform: {
    "^.+\\.[jt]sx?$": `<rootDir>/jest-transformer.js`,
  },
  moduleNameMapper: {
    "^highlight.js$": `<rootDir>/node_modules/highlight.js/lib/index.js`,
  },
  snapshotSerializers: [`jest-serializer-path`],
  collectCoverage: useCoverage,
  coverageReporters: [`json-summary`, `text`, `html`, `cobertura`],
  coverageThreshold: {
    global: {
      lines: 45,
      statements: 44,
      functions: 42,
      branches: 43,
    },
  },
  collectCoverageFrom: coverageDirs,
  reporters: process.env.CI
    ? [[`jest-silent-reporter`, { useDots: true }]]
    : [`default`].concat(useCoverage ? `jest-junit` : []),
  testEnvironment: `jest-environment-jsdom-fourteen`,
  moduleFileExtensions: [`js`, `jsx`, `ts`, `tsx`, `json`],
  setupFiles: [`<rootDir>/.jestSetup.js`],
}
