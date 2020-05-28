const yaml = require(`js-yaml`)
const fs = require(`fs`)

/**
 * Import yaml in server-side code using module resolution.
 *
 * e.g. in src/utils/my-util.js:
 *
 * ```
 * // imports from src/data/sidebars/doc-links.yaml
 * const docLinks = requireYaml(`../data/sidebars/doc-links.yaml`)
 * ```
 */
function requireYaml(path) {
  return yaml.load(fs.readFileSync(require.resolve(path)))
}

module.exports = { requireYaml }
