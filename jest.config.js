const path = require(`path`)
const glob = require(`glob`)

const pkgs = glob.sync(`./packages/*`).map(p => p.replace(/^\./, `<rootDir>`))

const distDirs = pkgs.map(p => path.join(p, `dist`))

module.exports = {
  notify: true,
  verbose: true,
  roots: pkgs,
  modulePathIgnorePatterns: distDirs,
  coveragePathIgnorePatterns: distDirs,
  testPathIgnorePatterns: [
    `/examples/`,
    `/www/`,
    `/dist/`,
    `/node_modules/`,
    `__tests__/fixtures`,
  ],
  moduleNameMapper: {
    "^graphql-skip-limit$": `<rootDir>/packages/graphql-skip-limit/src/index.js`,
    "^gatsby-plugin-sharp$": `<rootDir>/packages/gatsby-plugin-sharp/index.js`,
  },
}
