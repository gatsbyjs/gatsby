const { Resolver } = require('@parcel/plugin');
const path = require('path')
const fs = require('fs')

module.exports = new Resolver({
  async resolve({ specifier }) {
    // Resolvers don't support config, so load it manually, this is likely slow to do every resolve

    // TODO this is kinda weird, but it works for now
    if (!process.env.PARCEL_CONFIG_LOCATION) {
      return null
    }

    const confPath = path.join(process.env.PARCEL_CONFIG_LOCATION, 'bundle.config.json')
    const confContents = fs.readFileSync(confPath)
    const externals = JSON.parse(confContents)['externals']

    if (!externals) {
      return null
    }

    const matched = externals.some(pattern =>
      new RegExp(pattern).test(specifier)
    );
      
    if (matched) {
      return { isExcluded: true }
    };

    return null;
  }
});