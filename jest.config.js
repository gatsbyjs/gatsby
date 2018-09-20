const path = require(`path`)
const glob = require(`glob`)

const pkgs = glob.sync(`./packages/*`).map(p => p.replace(/^\./, `<rootDir>`))

const reGatsby = /gatsby$/
const gatsbyDir = pkgs.find(p => reGatsby.exec(p))
const gatsbyBuildDirs = [`dist`].map(dir => path.join(gatsbyDir, dir))
const builtTestsDirs = pkgs.map(p => path.join(p, `__tests__`))
const distTestDirs = pkgs.map(p => path.join(p, `dist`))
const ignoreDirs = [].concat(gatsbyBuildDirs, builtTestsDirs, distTestDirs)

module.exports = {
  notify: true,
  verbose: true,
  roots: pkgs,
  modulePathIgnorePatterns: ignoreDirs,
  coveragePathIgnorePatterns: ignoreDirs,
  testPathIgnorePatterns: [
    `/examples/`,
    `/www/`,
    `/dist/`,
    `/node_modules/`,
    `__tests__/fixtures`,
  ],
  transform: { '^.+\\.js$': `<rootDir>/jest-transformer.js` },
  moduleNameMapper: {
    "^highlight.js$": `<rootDir>/node_modules/highlight.js/lib/index.js`,
  },
  collectCoverage: true,
  coverageReporters: [`json-summary`, `text`],
  coverageThreshold: {
    global: {
      lines: 70,
      statements: 70,
      functions: 66,
      branches: 57,
    },
  },
}
