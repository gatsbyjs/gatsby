//const { getOptions } = require("loader-utils");

module.exports = async function(content) {
  const callback = this.async();
  //  const { pluginOptions: options } = getOptions(this) || {};

  const code = `import { SlideDeck } from 'mdx-deck'
${content.replace("export default", "export const slides =")}

// TODO: replace theme with a default theme and default components options?
// if no theme is defined, set to undefined
try {
  theme
} catch (e) {
  var theme = undefined;
}

// if no components are defined, set to undefined
try {
  components
} catch (e) {
  var components = undefined;
}

export default () =>
  <SlideDeck
    slides={slides}
    theme={theme}
    components={components}
    width='100vw'
    height='100vh'
  />`;

  return callback(null, code);
};
