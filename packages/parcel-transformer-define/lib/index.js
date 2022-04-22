const { Transformer } = require('@parcel/plugin')
const path = require('path')
const fs = require('fs')

module.exports = new Transformer({
  async loadConfig({config, options}) {
    // TODO this is kinda weird, but it works for now
    if (!process.env.PARCEL_CONFIG_LOCATION) {
      return {}
    }

    const confPath = path.join(process.env.PARCEL_CONFIG_LOCATION, 'bundle.config.json')
    const confContents = fs.readFileSync(confPath)
    const conf = JSON.parse(confContents)

    return conf['define']
  },

  async transform({config, asset}) {
    // TODO make this robust
    let code = await asset.getCode()
    Object.keys(config).forEach(replace => {
      const re = new RegExp(replace, 'g');
      code = code.replace(re, config[replace])
    })

    asset.setCode(code)
    return [asset]
  }
})