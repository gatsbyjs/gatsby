generateStaticPages = require './static-generation'
buildProductionBundle = require './build-production'
postBuild = require './post-build'

module.exports = (program) ->
  console.log "Generating static html pages"
  generateStaticPages program, (err, stats) ->
    if err
      console.log "failed at generating static html pages"
      return console.log err
    console.log "Compiling production bundle.js"
    buildProductionBundle program, (err, stats) ->
      if err
        console.log "failed to compile bundle.js"
        return console.log err
      console.log "Performing post-build steps"
      postBuild program, (err, results) ->
        if err
          console.log "failed to finish post-build steps"
          return console.log err
        console.log 'Done'
