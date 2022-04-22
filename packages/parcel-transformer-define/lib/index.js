const { Transformer } = require('@parcel/plugin');

module.exports = new Transformer({
  async loadConfig({config, options}) {
    let conf = await config.getConfigFrom(options.projectRoot + '/index', [], {
      packageKey: 'parcel-transformer-define',
    });

    return conf?.contents;
  },

  async transform({ asset, config }) {
    return [asset]
  }
});