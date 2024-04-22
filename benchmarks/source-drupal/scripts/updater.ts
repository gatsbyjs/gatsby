// @ts-ignore
import faker from "faker"

interface IArticle {
  id: string
  attributes: {
    title: string
  }
}

// Remove last word of title and replace it with a random word.
function updateTitle(title: string): string {
  return `${title.substring(0, title.lastIndexOf(` `))} ${faker.lorem.word()}`
}

async function patchArticle(
  username: string,
  password: string,
  server: string,
  article: IArticle,
): Promise<void> {
  const url = `${server}/jsonapi/node/article/${article.id}`

  const response = await fetch(url, {
    method: `PATCH`,
    headers: {
      "Content-Type": `application/vnd.api+json`,
      // @ts-ignore
      Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString(
        `base64`,
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

async function getFirstArticle(server: string): Promise<IArticle> {
  const url = `${server}/jsonapi/node/article?page[limit]=1&sort=created`
  const response = await globalThis.fetch(url)
  const body = await response.json()
  return body.data[0]
}

export async function update(
  username?: string | undefined,
  password?: string | undefined,
  server?: string | undefined,
): Promise<void> {
  if (!username || !password || !server) {
    console.error(`You must pass username, password and server`)
    return
  }

  const article = await getFirstArticle(server)
  await patchArticle(username, password, server, article)
}
