const { Resolver } = require('@parcel/plugin');

// TODO pull this into a config
const patterns = [
  'routes/render-page',
]

module.exports = new Resolver({
  async resolve({ specifier }) {
    const matched = patterns.some(pattern =>
      new RegExp(pattern).test(specifier)
    );
      
    if (matched) {
      console.log(`IGNORED: ${specifier}`)
      return { isExcluded: true }
    };

    return null;
  }
});