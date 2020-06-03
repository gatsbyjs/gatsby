const path = require(`path`)
const yaml = require(`js-yaml`)
const fs = require(`fs`)

/**
 * Import yaml in server-side code in a way that works when the site
 * is run as a theme.
 *
 * @example
 * ```
 * const docLinks = loadYaml(`src/data/sidebars/doc-links.yaml`)
 * ```
 */
function loadYaml(yamlPath) {
  return yaml.safeLoad(
    fs.readFileSync(path.resolve(`${__dirname}/../../${yamlPath}`))
  )
}

module.exports = { loadYaml }
