import Module from "module"

/**
 * @deprecated Use `createRequire` from Node's built-in `module` instead. This
 * was a polyfill for Node < 10.12, which is far below the minimum supported
 * version, and is now just an alias. To be removed in the next major.
 */
export const createRequireFromPath = Module.createRequire
