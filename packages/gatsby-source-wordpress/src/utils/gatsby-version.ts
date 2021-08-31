import semver from "semver"
const gatsbyVersion = require(`gatsby/package.json`)?.version

// gt = greater than
export const usingGatsbyV4OrGreater = semver.gt(gatsbyVersion, `4.0.0`)
