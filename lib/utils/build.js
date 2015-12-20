import generateStaticPages from './static-generation'
import buildProductionBundle from './build-production'
import postBuild from './post-build'
import globPages from './glob-pages'

module.exports = (program) => {
  const directory = program.directory
  let customPostBuild
  try {
    customPostBuild = require(directory + '/post-build')
  } catch (e) {
    // Do nothiing.
  }

  console.log('Generating static html pages')
  return generateStaticPages(program, (err) => {
    if (err) {
      console.log('failed at generating static html pages')
      return console.log(err)
    }
    console.log('Compiling production bundle.js')
    return buildProductionBundle(program, (e) => {
      if (e) {
        console.log('failed to compile bundle.js')
        return console.log(e)
      }
      console.log('Copying assets')
      return postBuild(program, (error) => {
        if (error) {
          console.log('failed to copy assets')
          return console.log(error)
        }
        if ( (typeof customPostBuild !== 'undefined' && customPostBuild !== null) ) {
          console.log('Performing custom post-build steps')
          return globPages(directory, (globError, pages) => {
            return customPostBuild(pages, (customPostBuildError) => {
              if (customPostBuildError) {
                console.log('customPostBuild function failed')
                console.error(customPostBuildError)
              }
              return console.log('Done')
            })
          })
        }
      })
    })
  })
}
