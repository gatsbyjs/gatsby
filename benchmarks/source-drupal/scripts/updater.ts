import fetch from "node-fetch"
import faker from "faker"

interface IArticle {
  id: string
  attributes: {
    title: string
  }
}

// Remove last word of title and replace it with a random word.
const updateTitle = (title: string): string =>
  `${title.substring(0, title.lastIndexOf(` `))} ${faker.lorem.word()}`

const patchArticle = async (
  username: string,
  password: string,
  server: string,
  article: IArticle
): Promise<void> => {
  const url = `${server}/jsonapi/node/article/${article.id}`

  const response = await fetch(url, {
    method: `PATCH`,
    headers: {
      "Content-Type": `application/vnd.api+json`,
      Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString(
        `base64`
      )}`,
    },
    body: JSON.stringify({
      data: {
        type: `node--article`,
        id: article.id,
        attributes: {
          title: updateTitle(article.attributes.title),
        },
      },
    }),
  })
}

const getFirstArticle = async (server: string): Promise<IArticle> => {
  const url = `${server}/jsonapi/node/article?page[limit]=1&sort=created`
  const response = await fetch(url)
  const body = await response.json()
  return body.data[0]
}

export const update = async (
  username?: string,
  password?: string,
  server?: string
): Promise<void> => {
  if (!username || !password || !server) {
    console.error(`You must pass username, password and server`)
    return
  }

  const article = await getFirstArticle(server)
  await patchArticle(username, password, server, article)
}
