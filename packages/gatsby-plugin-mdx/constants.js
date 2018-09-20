const path = require("path");

const CACHE_LOCATION = path.join(".cache", "gatsby-mdx");
const MDX_WRAPPERS_LOCATION = path.join(CACHE_LOCATION, "mdx-wrappers-dir");
const MDX_SCOPES_LOCATION = path.join(CACHE_LOCATION, "mdx-scopes-dir");

module.exports = {
  CACHE_LOCATION,
  MDX_WRAPPERS_LOCATION,
  MDX_SCOPES_LOCATION
};
