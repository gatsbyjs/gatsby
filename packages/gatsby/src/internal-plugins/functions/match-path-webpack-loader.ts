import type { LoaderDefinition } from "webpack"

const MatchPathLoader: LoaderDefinition = async function () {
  const params = new URLSearchParams(this.resourceQuery)
  const matchPath = params.get(`matchPath`)

  const modulePath = this.resourcePath

  return /* javascript */ `
  const preferDefault = m => (m && m.default) || m

  const functionToExecute = preferDefault(require('${modulePath}'));
  const matchPath = '${matchPath}';
  const { match: reachMatch } = require('@gatsbyjs/reach-router');

  module.exports = function(req, res) {
    let functionPath = req.originalUrl

    functionPath = functionPath.replace(new RegExp('^/*' + PREFIX_TO_STRIP), '')
    functionPath = functionPath.replace(new RegExp('^/*api/?'), '')

    const matchResult = reachMatch(matchPath, functionPath)
    if (matchResult) {
      req.params = matchResult.params
      if (req.params['*']) {
        // Backwards compatability for v3
        // TODO remove in v5
        req.params['0'] = req.params['*']
      }
    }

    return functionToExecute(req, res);
  }
  `
}

export default MatchPathLoader
