const glob = require(`glob`)

const pkgs = glob
  .sync(`${__dirname}/*/`)
  .map(p => p.replace(__dirname, `<rootDir>/integration-tests`))

module.exports = {
  rootDir: `../`,
  roots: pkgs,
  testPathIgnorePatterns: [
    `/examples/`,
    `/www/`,
    `/dist/`,
    `/node_modules/`,
    `__tests__/fixtures`,
    `__testfixtures__`,
    `.cache`,
  ],
  transform: { "^.+\\.[jt]s$": `<rootDir>/jest-transformer.js` },
}
