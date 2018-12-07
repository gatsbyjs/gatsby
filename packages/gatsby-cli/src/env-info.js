const envinfo = require(`envinfo`)

module.exports = options =>
  envinfo.run(
    {
      System: [`OS`, `CPU`, `Shell`],
      Binaries: [`Node`, `npm`, `Yarn`],
      Browsers: [`Chrome`, `Edge`, `Firefox`, `Safari`],
      npmPackages: `gatsby*`,
      npmGlobalPackages: `gatsby*`,
    },
    options
  )
