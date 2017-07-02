const fs = require(`fs`)
const stringify = require(`json-stringify-safe`)
const fetchData = require(`../src/fetch`)

// Fetch data from our sample site and save it to disk.
const spaceId = `rocybtov1ozk`
const accessToken = `6f35edf0db39085e9b9c19bd92943e4519c77e72c852d961968665f1324bfc94`

fetchData({ spaceId, accessToken }).then(data => {
  fs.writeFileSync(
    `${__dirname}/../src/__tests__/data.json`,
    stringify(data, null, 4)
  )
})
