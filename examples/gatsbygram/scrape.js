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
const toISO8601 = timestamp => new Date(timestamp * 1000).toJSON()

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

let posts = [];


// Write json
const saveJSON = _ => fs.writeFileSync(`./data/posts.json`, JSON.stringify(posts, "", 2))

const getPosts = (maxId) => {
  let url = `https://www.instagram.com/${username}/media`
  if (maxId) url += `?max_id=${maxId}`

  request(
    url,
    { encoding: `utf8` },
    (err, res, body) => {
      if (err) console.log(`error: ${err}`)
      body = JSON.parse(body);
      // Parse posts
      let lastId
      body.items
        .filter(item => item.type === `image`)
        .map(item => {
          // Parse item to a simple object
          return {
            id: get(item, `id`),
            code: get(item, `code`),
            username: get(item, `user.username`),
            avatar: get(item, `user.profile_picture`),
            time: toISO8601(get(item, `created_time`)),
            type: get(item, `type`),
            likes: get(item, `likes.count`),
            comment: get(item, `comments.count`),
            text: get(item, `caption.text`),
            media: get(item, `images.standard_resolution.url`),
            image: `images/${item.code}.jpg`,
          }
        })
        .forEach(item => {
          if (posts.length >= 100) return

          // Download image locally
          bar.total++
          download(item.media, `./data/images/${item.code}.jpg`, () => bar.tick())

          // Add item to posts
          posts.push(item)

          // Save lastId for next request
          lastId = item.id
        })

      if (posts.length < 100 && get(body, `more_available`))
        getPosts(lastId)
      else
        saveJSON()
    }
  )
}

getPosts()