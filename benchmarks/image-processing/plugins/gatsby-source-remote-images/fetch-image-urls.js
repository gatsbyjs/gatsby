const { Sema } = require(`async-sema`)
const fetch = require(`node-fetch`)
const _ = require(`lodash`)
const fs = require(`fs`)
const path = require(`path`)

const baseUrl = `http://www.splashbase.co/api/v1/images/`

const s = new Sema(
  10, // Allow 10 concurrent async calls
  {
    capacity: 100, // Prealloc space for 100 tokens
  }
)

async function fetchData(x) {
  await s.acquire()
  try {
    return await fetch(`${baseUrl}${x}`).then(res => res.json())
  } finally {
    s.release()
  }
}

const main = async () => {
  let data = await Promise.all(_.range(2000).map(fetchData))
  data = data.filter(d => d.url).map(d => d.url)
  data = data.map(d => {
    return {
      url: d,
      parsed: path.parse(d),
    }
  })
  data = data.filter(d => d.parsed.ext.toLowerCase().slice(0, 4) === `.jpg`)
  data = data.map(d => d.url)
  // console.log(data)
  console.log(`total: ${data.length}`)
  fs.writeFileSync(`./urls.json`, JSON.stringify(data, null, 4))
}

main()
