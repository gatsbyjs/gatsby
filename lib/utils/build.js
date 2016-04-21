import buildStaticSite from './build-static'
import buildProductionBundle from './build-spa'
import postBuild from './post-build'
import globPages from './glob-pages'
import toml from 'toml'
import fs from 'fs'


function customPost (program, callback) {
  const directory = program.directory
  let customPostBuild
  try {
    customPostBuild = require(`${directory}/post-build`)
  } catch (e) {
    if (e.code !== 'MODULE_NOT_FOUND') {
      console.log('Failed to load custom post build script. It will be skipped.')
      console.log(e)
    }
  }

  if (customPostBuild) {
    console.log('Performing custom post-build steps')

    globPages(directory, (globError, pages) =>
      customPostBuild(pages, (error) => {
        if (error) {
          console.log('customPostBuild function failed')
          callback(error)
        }
        return callback()
      })
    )
  } else {
    callback()
  }
}

function post (program, callback) {
  console.log('Copying assets')

  postBuild(program, (error) => {
    if (error) {
      console.log('failed to copy assets')
      return callback(error)
    }

    return customPost(program, callback)
  })
}

function bundle (program, callback) {
  console.log('Compiling production bundle.js')

  buildProductionBundle(program, (error) => {
    if (error) {
      console.log('failed to compile bundle.js')
      return callback(error)
    }

    return post(program, callback)
  })
}

function html (program, callback) {
  console.log('Generating static HTML/CSS')

  const directory = program.directory
  let config
  try {
    config = toml.parse(fs.readFileSync(`${directory}/config.toml`))
  } catch (error) {
    console.log("Couldn't load your site config")
    callback(error)
  }

  buildStaticSite(program, (error) => {
    if (error) {
      console.log('Failed at generating static HTML/CSS')
      return callback(error)
    }

    // If we're not generating a SPA, go directly to post build steps
    if (config.noProductionJavascript) {
      post(program, callback)
    } else {
      bundle(program, callback)
    }
    return true
  })
}

module.exports = html
