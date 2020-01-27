const faker = require(`faker`)
const matter = require(`gray-matter`)

const MAX_NUM_ROWS = parseInt(process.env.MAX_NUM_ROWS || 25, 10)

module.exports = index => `
${matter
  .stringify(``, {
    title: faker.lorem.sentence(),
    slug: `/${faker.helpers.slugify(faker.lorem.sentence())}`,
  })
  .trim()}

## Page #${index}

### API

|Name|Description|Required|
|:--:|-----------|--------|
${new Array(faker.random.number(MAX_NUM_ROWS))
  .fill(undefined)
  .map(() =>
    `
|${faker.lorem.word()}|${faker.lorem.sentence()}|${faker.random.boolean()}|
`.trim()
  )
  .join(`\n`)}

### More Detail

${faker.lorem.paragraphs()}
`
