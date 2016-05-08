import buildCSS from './build-css'
import buildHTML from './build-html'
import buildProductionBundle from './build-javascript'
import postBuild from './post-build'
import globPages from './glob-pages'
import toml from 'toml'
import fs from 'fs'


function customPost (program, callback) {
  const directory = program.directory
  let customPostBuild
  try {
    const gatsbyNodeConfig = require(`${directory}/gatsby-node`)
    customPostBuild = gatsbyNodeConfig.postBuild
  } catch (e) {
    if (e.code !== 'MODULE_NOT_FOUND') {
      console.log('Failed to load gatsby-node.js, skipping custom post build script', e)
    }
  }

  if (customPostBuild) {
    console.log('Performing custom post-build steps')

    return globPages(directory, (globError, pages) =>
      customPostBuild(pages, (error) => {
        if (error) {
          console.log('customPostBuild function failed')
          callback(error)
        }
        return callback()
      })
    )
  }

  return callback()
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

  buildCSS(program, (cssError) => {
    if (cssError) {
      console.log('Failed at generating styles.css')
      return callback(cssError)
    }

    return buildHTML(program, (htmlError) => {
      if (htmlError) {
        console.log('Failed at generating HTML')
        return callback(htmlError)
      }

      // If we're not generating javascript, go directly to post build steps
      if (config.noProductionJavascript) {
        return post(program, callback)
      } else {
        return bundle(program, callback)
      }
    })
  })
}

module.exports = html
