/* eslint-disable no-console */
// turn function into a no-op passthrough
// this is so that people don't really have to change their code
module.exports = function componentWithMDXScope(componentPath) {
  console.warn(`componentWithMDXScope is deprecated. You don't need it anymore`)
  return componentPath
}
