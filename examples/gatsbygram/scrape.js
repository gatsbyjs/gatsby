const fs = require("fs")
const request = require("request")
const mkdirp = require("mkdirp")
const ProgressBar = require("progress")
const { get } = require("lodash")
const download = require("./utils/download-file")

const username = process.argv[2]

if (!username) {
  console.log(
    `
You didn't supply an Instagram username!
Run this command like:

node scrape.js INSTAGRAM_USERNAME
              `
  )
  process.exit()
}

// Convert timestamp to ISO 8601.
const toISO8601 = (timestamp) => new Date(timestamp * 1000).toJSON()

// Create the progress bar
const bar = new ProgressBar(
  `Downloading instagram posts [:bar] :current/:total :elapsed secs :percent`,
  {
    total: 0,
    width: 30,
  }
)

// Create the images directory
mkdirp.sync(`./data/images`)

request(`https://www.instagram.com/${username}/media`, { encoding: `utf8` }, (err, res, body) => {
  if (err) console.log(`error: ${err}`)

  // Parse posts
  const posts = JSON.parse(body).items
    .filter(item => item.type === `image`)
    .map(item => {
      const imgUrl = get(item, `images.standard_resolution.url`, "")

      // Download image locally
      bar.total++
      download(imgUrl, `./data/images/${item.code}.jpg`, () => bar.tick())

      // Return a simplify object
      return {
        id: item.code,
        username: item.user.username,
        avatar: item.user.profile_picture,
        time: toISO8601(item[`created_time`]),
        type: item.type,
        likes: item.likes.count,
        comment: item.comments.count,
        text: item.caption.text,
        media: imgUrl,
        image: `images/${item.code}.jpg`
      }
    })

  // Write json
  fs.writeFileSync(`./data/posts.json`, JSON.stringify(posts, "", 2))
})
