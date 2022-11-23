// Makes a string safe for using as a folder or npm package name
export const makeNpmSafe = (str: string): string =>
  str
    // Replace camelcase with kebab
    .replace(/([a-z])([A-Z])/g, `$1-$2`)
    .toLowerCase()
    // Replace any number of consecutive illegal characters with a single dash
    .replace(/[^a-z0-9_.]+/g, `-`)
    // Remove trailing dots and dashes
    .replace(/^[_\-.]+|[_\-.]+$/g, ``)
