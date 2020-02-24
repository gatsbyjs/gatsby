const https = require('https')

module.exports = (url, options) => {
  return new Promise((resolve, reject) => {
    const req = https
      .request(url, options, res => {
        let data = ''
        res.on('data', chunk => {
          data += chunk
        })
        res.on('end', () => {
          if (res.statusCode >= 400) {
            const err = new Error(`Received status code ${res.statusCode}`)
            err.response = res
            err.data = data
            reject(err)
          } else {
            resolve({ res, data: JSON.parse(data) })
          }
        })
      })
      .on('error', reject)
    if (options.body) {
      req.end(JSON.stringify(options.body))
    } else {
      req.end()
    }
  })
}
