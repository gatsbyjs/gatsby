require('node-cjsx').transform()
import opn from 'opn'
import globPages from './glob-pages'
import devServer from './dev-server'

module.exports = (program) => {
  const directory = program.directory

  // Load pages for the site.
  return globPages(directory, (err, pages) =>
    devServer(program, pages, server => {
      server.start((e) => {
        if (e) {
          console.log(e)
        }
        if (program.open) {
          opn(server.info.uri)
        }
        console.log('Listening at:', server.info.uri)
      })
    })
  )
}
