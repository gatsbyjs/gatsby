const { Resolver } = require('@parcel/plugin');

module.exports = new Resolver({
  async resolve({ specifier }) {
    try {
        return {
            filePath: require.resolve(specifier),
        };
    }
    catch (e) {
        return null;
    }
},
});