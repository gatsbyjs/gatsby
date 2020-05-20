const faker = require(`faker`)
const matter = require(`gray-matter`)

const MAX_NUM_ROWS = parseInt(process.env.MAX_NUM_ROWS || 25, 10)

module.exports = index => `${matter
  .stringify(``, {
    title: faker.lorem.sentence(),
    description: faker.lorem.sentence(),
    path: `/${faker.helpers.slugify(faker.lorem.sentence())}`,
    date: faker.date.recent(1000).toISOString().slice(0, 10),
    tags: `[${faker.random
      .words(3)
      .split(` `)
      .map(w => `"${w}"`)
      .join(`, `)}]`,
  })
  .trim()}

## Page #${index} : ${faker.random.words(4)}

### API


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
