const path = require('path')
const fs = require('fs')
const https = require('https')
const url = require('url')

const getJSON = (jsonURL, callback) => {
  return https.get(jsonURL, res => {
    if (res.statusCode === 302) {
      let redirect = url.parse(jsonURL)
      redirect.pathname = res.headers.location
      return getJSON(url.format(redirect), callback)
    }
    let data = ''
    res.on('data', chunk => {
      data += chunk
    })

    res.on('end', () => {
      try {
        return callback(null, JSON.parse(data))
      } catch (e) {
        return callback(e)
      }
    })
  })
    .on('error', callback)
}

/*
 *
 */
getJSON('https://unpkg.com/gatsby/apis.json', (err, data) => {
  if (err) {
    console.log(`An error occurred attempting to cache Gatsby APIs. We'll try again next run!`)
    return 
  }
  return fs.writeFile(path.join(__dirname, '..', 'latest-apis.json'), JSON.stringify(data, null, 2), writeErr => {
    console.log(writeErr)
  })
})
  
