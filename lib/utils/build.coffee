generateStaticPages = require './static-generation'
buildProductionBundle = require './build-production'
postBuild = require './post-build'

module.exports = (program) ->
  console.log "Generating static html pages"
  generateStaticPages program, (err, stats) ->
    console.log "Compiling production bundle.js"
    buildProductionBundle program, (err, stats) ->
      console.log "Performing post-build steps"
      postBuild program, (err, results) ->
        console.log 'Done'
