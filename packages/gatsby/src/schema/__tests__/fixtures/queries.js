const os = require(`os`)
const path = require(`path`)

const dir = os.platform() === "win32" ? "C:/Users/test/site" : "/home/test/site"

const getTestNodes = () => [
  {
    id: `file1`,
    parent: null,
    children: [`md1`],
    internal: {
      type: `File`,
      contentDigest: `file1`,
    },
    name: `1.md`,
    dir,
    absolutePath: path.posix.join(dir, `1.md`)
  },
  {
    id: `file2`,
    parent: null,
    children: [`md2`],
    internal: {
      type: `File`,
      contentDigest: `file2`,
    },
    name: `2.md`,
    dir,
    absolutePath: path.posix.join(dir, `2.md`)
  },
  {
    id: `file3`,
    parent: null,
    children: [`author2`, `author1`],
    internal: {
      type: `File`,
      contentDigest: `file3`,
    },
    name: `authors.yaml`,
    dir,
    absolutePath: path.posix.join(dir, `authors.yaml`)
  },
  {
    id: `md1`,
    parent: `file1`,
    children: [],
    internal: {
      type: `Markdown`,
      contentDigest: `md1`,
    },
    frontmatter: {
      title: `Markdown File 1`,
      views: 200,
      price: "1.99",
      tags: [],
      date: new Date(Date.UTC(2019, 0, 1)),
      authors: [`author2@example.com`, `author1@example.com`],
      reviewer___NODE: `author2`,
      reviewerByEmail: `author2@example.com`,
      fileRef: `2.md`
    },
  },
  {
    id: `md2`,
    parent: `file2`,
    children: [],
    internal: {
      type: `Markdown`,
      contentDigest: `md2`,
    },
    frontmatter: {
      title: `Markdown File 2`,
      tags: [`constructor`],
      views: 100,
      price: "3.99",
      published: false,
      authors: [`author1@example.com`],
      reviewer___NODE: null,
      reviewerByEmail: null,
    },
  },
  {
    id: `author1`,
    parent: `file3`,
    children: [],
    internal: {
      type: `Author`,
      contentDigest: `author1`,
    },
    name: `Author 1`,
    email: `author1@example.com`,
  },
  {
    id: `author2`,
    parent: `file3`,
    children: [],
    internal: {
      type: `Author`,
      contentDigest: `author1`,
    },
    name: `Author 2`,
    email: `author2@example.com`,
  },
  {
    id: `parent1`,
    parent: null,
    children: [`child1`],
    internal: {
      type: `FirstParent`,
      contentDigest: `parent1`,
    },
    name: `Parent 1`,
  },
  {
    id: `parent3`,
    parent: null,
    children: [`child3`],
    internal: {
      type: `FirstParent`,
      contentDigest: `parent3`,
    },
    name: `Parent 3`,
  },
  {
    id: `parent2`,
    parent: null,
    children: [`child2`],
    internal: {
      type: `SecondParent`,
      contentDigest: `parent2`,
    },
    name: `Parent 2`,
  },
  {
    id: `child1`,
    parent: `parent1`,
    children: [],
    internal: {
      type: `FirstChild`,
      contentDigest: `child1`,
    },
    name: `Child 1`,
  },
  {
    id: `child2`,
    parent: `parent2`,
    children: [],
    internal: {
      type: `FirstChild`,
      contentDigest: `child2`,
    },
    name: `Child 2`,
  },
  {
    id: `child3`,
    parent: `parent3`,
    children: [],
    internal: {
      type: `Child`,
      contentDigest: `child3`,
    },
    name: `Child 3`,
  },
]

module.exports = getTestNodes
