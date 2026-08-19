import Module from "module"

// `Module.createRequire` has been available since Node v12.2.0, which is
// below our minimum supported Node version, so no polyfill is needed.
export const createRequireFromPath = Module.createRequire
