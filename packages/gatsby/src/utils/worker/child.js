// Note: this doesn't check for conflicts between module exports
import { getFilePath } from "./page-data"

module.exports = {
  getFilePath,
  ...require(`./render-html`),
}
