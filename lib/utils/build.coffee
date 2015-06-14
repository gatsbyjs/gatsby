generateStaticPages = require './static-generation'
buildProductionBundle = require './build-production'
postBuild = require './post-build'
globPages = require './glob-pages'

module.exports = (program) ->
  {directory} = program
  app = require directory + "/app"
  try
    customPostBuild = require directory + "/post-build"
  catch e

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
      console.log "Copying assets"
      postBuild program, (err, results) ->
        if err
          console.log "failed to copy assets"
          return console.log err
        if customPostBuild?
          console.log "Performing custom post-build steps"
          globPages directory, (err, pages) ->
            customPostBuild pages, (err) ->
              console.log 'Done'
