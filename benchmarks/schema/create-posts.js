#!/usr/bin/node
const fs = require(`fs-extra`)
const path = require(`path`)
const faker = require(`faker`)
const fetch = require(`node-fetch`)
const YAML = require(`yamljs`)

const BASEPATH = `./data`
fs.ensureDirSync(BASEPATH)
fs.emptyDirSync(BASEPATH)

const IMAGE_BASEPATH = `./static/images`
fs.ensureDirSync(IMAGE_BASEPATH)
fs.emptyDirSync(IMAGE_BASEPATH)

const NUM_AUTHORS = 1000
const NUM_TAGS = 100
const NUM_POSTS = 10000
const NUM_IMAGES = 2

const range = num => [...Array(num).keys()]
const pick = arr => arr[Math.floor(Math.random() * arr.length)]

const imageDigits = NUM_IMAGES.toString().length
const createImage = async num => {
  const url = faker.image.avatar()
  const response = await fetch(url)
  const image = await response.buffer()
  const filename = path.join(
    IMAGE_BASEPATH,
    num.toString().padStart(imageDigits, `0`) + `.jpg`
  )
  fs.writeFileSync(filename, image)
  return `../` + filename
}

const createAuthor = images => {
  return {
    name: faker.name.lastName(),
    firstname: faker.name.firstName(),
    email: faker.internet.email(),
    image: pick(images),
  }
}

const createFrontmatter = (authors, tags) => {
  return {
    title: faker.lorem.sentence(),
    date: faker.date.past().toJSON(),
    published: pick([true, false]),
    authors: range(2).map(() => pick(authors).email),
    tags: range(3).map(() => pick(tags)),
  }
}

const createMarkdown = async (authors, tags) => {
  const frontmatter = await createFrontmatter(authors, tags)
  const heading = faker.lorem.sentence()
  const text = faker.lorem.paragraph()
  return `---
title: ${frontmatter.title}
date: ${frontmatter.date}
published: ${frontmatter.published}
authors: [${frontmatter.authors.join(`, `)}]
tags: [${frontmatter.tags.join(`, `)}]
---

# ${heading}

${text}
`
}

const digits = NUM_POSTS.toString().length
const createFile = (content, num) =>
  fs.writeFile(
    path.join(BASEPATH, num.toString().padStart(digits, `0`) + `.md`),
    content,
    err => {
      if (err) throw err
    }
  )

Promise.all(range(NUM_IMAGES).map(createImage))
  .then(images =>
    Promise.all(range(NUM_AUTHORS).map(() => createAuthor(images)))
  )
  .then(authors => {
    fs.writeFileSync(
      path.join(BASEPATH, `authors.yaml`),
      YAML.stringify(authors)
    )
    const tags = range(NUM_TAGS).map(faker.lorem.word)
    return Promise.all(
      range(NUM_POSTS).map(() => createMarkdown(authors, tags))
    )
  })
  .then(posts => Promise.all(posts.map(createFile)))
  .then(() => console.log(`Done`))
