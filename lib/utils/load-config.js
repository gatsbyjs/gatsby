import fs from 'fs'
import path from 'path'
import toml from 'toml'
import yaml from 'js-yaml'

const DEFAULT_SITE_CONFIG = {}

const CONFIG_FILE_TYPE_MAPPINGS = {
  toml: toml.parse,
  json: JSON.parse,
  yml: yaml.safeLoad,
  yaml: yaml.safeLoad,
}
const FILE_EXTENSIONS = Object.keys(CONFIG_FILE_TYPE_MAPPINGS)

module.exports = function loadConfig (directory) {
  for (let i = 0; i < FILE_EXTENSIONS.length; i++) {
    const fileExtension = FILE_EXTENSIONS[i]
    const filePath = path.join(directory, `config.${fileExtension}`)
    if (fs.existsSync(filePath)) {
      const loader = CONFIG_FILE_TYPE_MAPPINGS[fileExtension]
      return loader(fs.readFileSync(filePath))
    }
  }
  return DEFAULT_SITE_CONFIG
}
