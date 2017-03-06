const { InstagramPosts } = require("instagram-screen-scrape")
const url = require("url")
const fs = require("fs")
const ProgressBar = require("progress")

const download = require("./utils/download-file")

// Create the stream
const streamOfPosts = new InstagramPosts({ username: `kyle__mathews` })

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
