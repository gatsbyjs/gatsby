const { DefinePlugin } = require(`webpack`)

module.exports = class LocalWebpackPlugin1 {
  constructor() {
    this.plugin = new DefinePlugin({
      REPLACE_ME_1: JSON.stringify(`localWebpackPlugin1_1`),
    })
  }

  apply(compiler) {
    this.plugin.apply.call(this.plugin, compiler)
  }
}
