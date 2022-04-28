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
    const aliases = JSON.parse(confContents)['aliases']

    if (!aliases) {
      return null
    }

    const specifierParts = specifier.split('/')
    for (const alias of Object.keys(aliases)) {
      const aliasParts = alias.split('/')
      
      if (aliasParts.length > specifierParts.length) {
        continue
      }
      
      const specifierPath = specifierParts.slice(0, aliasParts.length).join('/')

      if (alias === specifierPath) {
        const newSpecifier = aliases[alias] + specifier.substring(specifierPath.length)
        
        return {
          filePath: require.resolve(newSpecifier),
        };
      }
    }    

    return null;
  }
});