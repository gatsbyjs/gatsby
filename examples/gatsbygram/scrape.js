const { InstagramPosts } = require("instagram-screen-scrape")
const url = require("url")
const fs = require("fs")
const ProgressBar = require("progress")
const mkdirp = require("mkdirp")

const username = process.argv[2]

if (!username) {
  console.log(`
You didn't supply an Instagram username!
Run this command like:

node scrape.js INSTAGRAM_USERNAME
              `)
  process.exit()
}

const download = require("./utils/download-file")

// Create the images directory
mkdirp.sync(`./data/images`)

// Create the stream
const streamOfPosts = new InstagramPosts({ username, })

// Create the progress bar
const bar = new ProgressBar(`Downloading instagram posts [:bar] :current/:total :elapsed secs :percent`, {
  total: 0,
  width: 30,
})

const posts = []
streamOfPosts.on(`data`, (post) => {
  // Ignore video files.
  if (post && post.media && post.media.slice(-3) === `mp4`) {
    return
  }

  // Only download the first 100 posts.
  if (posts.length >= 100) {
    return
  }

  // Up total
  bar.total += 1

  // Convert timestamp to ISO 8601.
  post.time = new Date(post.time * 1000).toJSON()

  const parsedUrl = url.parse(post.media)
  const splitPathname = parsedUrl.pathname.split(`/`)
  const newPathname = [].concat(splitPathname[0], splitPathname[1], splitPathname.slice(-1)).join(`/`)
  const newUrl = `${parsedUrl.protocol}//${parsedUrl.host}${newPathname}`

  // Delay downloading a bit so our scrapping can catchup so our progressbar
  // proceeds smoothly.
  setTimeout(() => {
    download(newUrl, `./data/images/${post.id}.jpg`, () => bar.tick())
  }, 1000)

  // In our json representation of the post, link to the downloaded image.
  // This will be used in our Gatsby code to access the image.
  post.image = `images/${post.id}.jpg`
  posts.push(post)
})

streamOfPosts.on(`end`, () => {
  fs.writeFileSync(`./data/posts.json`, JSON.stringify(posts))
})
