import faker from "faker";
import { SiteClient } from "datocms-client";

interface IArticle {
  id: string;
  title: string;
}

// Remove last word of title and replace it with a random word.
function updateTitle(title: string): string {
  return `${title.substring(0, title.lastIndexOf(` `))} ${faker.lorem.word()}`;
}

async function updateArticle(client: any, article: IArticle): Promise<void> {
  await client.items.update(article.id, {
    title: updateTitle(article.title),
  });
}

async function getArticle(client: any, itemType: string): Promise<IArticle> {
  return await client.items
    .all({ "filter[type]": itemType, "page[limit]": 1 })
    .then((records: any) => {
      return Promise.resolve(records.pop());
    });
}

export async function update(token?: string | undefined): Promise<void> {
  if (!token) {
    console.error(`You must pass in a DatoCMS API token`);
    return;
  }

  const client = new SiteClient(token);
  const models = await client.itemTypes.all();
  const { id: itemType } = models.find((m: any) => m.apiKey === "article");
  if (!itemType) {
    throw new Error("Article type not found");
  }

  const article = await getArticle(client, itemType);
  await updateArticle(client, article);
}
