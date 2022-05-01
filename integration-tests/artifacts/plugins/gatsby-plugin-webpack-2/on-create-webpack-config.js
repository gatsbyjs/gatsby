const { DefinePlugin } = require(`webpack`)

class LocalWebpackPlugin2 {
  constructor() {
    this.plugin = new DefinePlugin({
      REPLACE_ME_2: JSON.stringify(`localWebpackPlugin2_1`),
    })
  }

  apply(compiler) {
    this.plugin.apply.call(this.plugin, compiler)
  }
}

module.exports = ({ actions }) => {
  actions.setWebpackConfig({
    plugins: [new LocalWebpackPlugin2()],
  })
}
