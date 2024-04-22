const faker = require("faker")

async function flotiqRequest(
  url,
  method,
  apiKey,
  _contentTypeName,
  contentObject,
) {
  let headers = {
    accept: "application/json",
  }

  headers["X-AUTH-TOKEN"] = apiKey

  let payload = {
    method: method,
    headers: { ...headers, "Content-Type": "application/json" },
  }
  if (method == "POST" || method == "PUT") {
    payload.body = JSON.stringify(contentObject)
  }
  return await globalThis.fetch(url, payload)
}

// Remove last word of title and replace it with a random word.
function updateTitle(title) {
  return `${title.substring(0, title.lastIndexOf(` `))} ${faker.lorem.word()}`
}

async function fetchOneArticle(apiKey) {
  let url = "https://api.flotiq.com/api/v1/content/article?limit=1"
  let response = await flotiqRequest(url, "GET", apiKey, "article", {})
  let responseJson = await response.json()
  let article = responseJson.data[0]
  return article
}

async function updateArticle(apiKey, article) {
  let url = "https://api.flotiq.com/api/v1/content/article/" + article.id
  let response = await flotiqRequest(url, "PUT", apiKey, "article", article)
  if ((await response.status) !== 200) {
    throw "Article not saved, API response status code = " + response.status
  }
}

async function update({ apiKey }) {
  if (!apiKey) {
    console.error(`You must add the BENCHMARK_FLOTIQ_API_TOKEN env variable`)
    return
  }

  const article = await fetchOneArticle(apiKey)

  article.title = updateTitle(article.title)
  updateArticle(apiKey, article)
  console.log(
    "Updated article ID=" + article.id + ", new title: " + article.title,
  )
}

module.exports = update
