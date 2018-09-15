const injectTwitterScript = () => {
  // Copied from:
  // https://developer.twitter.com/en/docs/twitter-for-websites/javascript-api/guides/set-up-twitter-for-websites
  window.twttr = (function(d, s, id) {
    var js,
      fjs = d.getElementsByTagName(s)[0],
      t = window.twttr || {}
    if (d.getElementById(id)) return t
    js = d.createElement(s)
    js.id = id
    js.src = `https://platform.twitter.com/widgets.js`
    fjs.parentNode.insertBefore(js, fjs)

    t._e = []
    t.ready = function(f) {
      t._e.push(f)
    }

    return t
  })(document, `script`, `twitter-wjs`)
}

let renderTweets = false
const allTweets = []

exports.onRouteUpdate = function() {
  renderTweets = true
  const tweets = document.querySelectorAll(`.twitter-tweet`)

  // If there's an embedded tweet, lazy-load the twitter script (if it hasn't
  // already been loaded), and then render the tweets.
  if (tweets.length > 0) {
    if (!document.querySelector(`#twitter-wjs`)) injectTwitterScript()

    // Prevent the Twitter script automatically rendering tweets, and hide them
    tweets.forEach(tweet => {
      tweet.className = `twitter-tweet-unrendered`
      tweet.style.display = `none`
    })

    window.twttr.ready(() =>
      tweets.forEach(tweet => {
        const url = tweet.querySelector(`a[href*="/status/"]`).href
        const id = url.match(/\/status\/([0-9]+)/)[1]

        window.twttr.widgets
          .createTweet(id, tweet.parentNode)
          .then(renderedTweet => {
            if (renderTweets) {
              tweet.parentNode.insertBefore(renderedTweet, tweet)
              allTweets.push(renderedTweet)
            } else {
              renderedTweet.remove()
            }
          })
      })
    )
  }
}

exports.onPreRouteUpdate = function() {
  // Remove rendered tweets before navigating away, to prevent
  // memory leaks with React (since it's unaware of them)
  allTweets.forEach(renderedTweet => renderedTweet.remove())

  // Make sure tweets rendered later are removed (e.g. if the user
  // navigates away quickly, before the Twitter script loads)
  renderTweets = false
}
