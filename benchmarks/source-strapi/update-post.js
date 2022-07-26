require("dotenv").config()

const fetch = require("node-fetch")

const getRandomArticle = async () => {
  // Get random article ID
  const randomIndex = Math.floor(
    Math.random() * (Number(process.env.BENCHMARK_STRAPI_DATASET))
  )
  // Fetch article data
  const articlesResponse = await fetch(
    `${process.env.BENCHMARK_STRAPI_API_URL}/articles?_start=${randomIndex}&_limit=1`
  )
  const articles = await articlesResponse.json()
  return articles[0]
}

const updateArticle = async (article) => {
  // Add ! at the end of the title
  const response = await fetch(
    `${process.env.BENCHMARK_STRAPI_API_URL}/articles/${article.id}?token=${process.env.BENCHMARK_STRAPI_UPDATE_TOKEN}`,
    {
      method: 'PUT',
      body: JSON.stringify({
        title: article.title + '!',
      }),
    },
  )
  if (response.ok) {
    console.log('update success')
  } else {
    console.log('update error')
  }
}

const start = async () => {
  // Fetch random existing article
  const article = await getRandomArticle()
  // Update it
  await updateArticle(article)
}

start()
