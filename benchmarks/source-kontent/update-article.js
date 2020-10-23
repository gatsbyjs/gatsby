const { ManagementClient } = require('@kentico/kontent-management');
const { DeliveryClient } = require('@kentico/kontent-delivery');

require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`,
});


(async () => {

  const dClient = new DeliveryClient({
    projectId: process.env.BENCHMARK_KONTENT_PROJECT_ID,
  })

  const mClient = new ManagementClient({
    projectId: process.env.BENCHMARK_KONTENT_PROJECT_ID, // ID of your Kentico Kontent project
    apiKey: process.env.BENCHMARK_KONTENT_MANAGEMENT_KEY, // Management API token
  });

  try {

    const randomDoc = Math.floor(Math.random() * (Number(process.env.BENCHMARK_KONTENT_DATASET_SIZE) || 512))

    const article = await dClient
      .items()
      .type('article')
      .limitParameter(1)
      .elementsParameter(['title'])
      .equalsFilter('elements.article_number', randomDoc)
      .toPromise()
      .then(response => response.getFirstItem());

    await mClient.createNewVersionOfLanguageVariant()
      .byItemCodename(article.system.codename)
      .byLanguageCodename(article.system.language)
      .toPromise();

    const languageVariant = await mClient.upsertLanguageVariant()
      .byItemCodename(article.system.codename)
      .byLanguageCodename(article.system.language)
      .withElements([{
        element: {
          codename: "title"
        },
        value: article.title.value + "!"
      }])
      .toPromise()

    await mClient
      .publishOrScheduleLanguageVariant()
      .byItemId(languageVariant.data.item.id)
      .byLanguageId(languageVariant.data.language.id)
      .withoutData()
      .toPromise();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})()
