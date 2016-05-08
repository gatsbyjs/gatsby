import Promise from 'bluebird'
import cheerio from 'cheerio'
import devServer from '../../lib/utils/dev-server'
import globPages from '../../lib/utils/glob-pages'

function programStub (fixturePath) {
  return {
    directory: fixturePath,
    port: 8000,
    host: '0.0.0.0',
  }
}

function createServer (server) {
  return {
    server,
    get (url) {
      const injectOptions = (typeof url === 'string') ? { url } : url
      return new Promise(resolve => {
        server.inject(injectOptions, response => {
          resolve(cheerio.load(response.payload))
        })
      })
    },
    getHtml (url) {
      return this.get({
        url,
        headers: { accept: 'text/html' },
      })
    },
  }
}

export function develop (fixturePath) {
  const program = programStub(fixturePath)

  return new Promise(resolve => {
    globPages(fixturePath, (error, pages) => {
      devServer(program, pages, server => {
        resolve(createServer(server))
      })
    })
  })
}
