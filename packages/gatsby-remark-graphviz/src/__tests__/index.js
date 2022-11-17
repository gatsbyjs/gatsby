const Remark = require(`remark`)
const toHAST = require(`mdast-util-to-hast`)
const hastToHTML = require(`hast-util-to-html`)
const cheerio = require(`cheerio`)
const plugin = require(`../`)

const remark = new Remark().data(`settings`, {
  commonmark: true,
  footnotes: true,
  pedantic: true,
})

const run = async content => {
  const markdownAST = remark.parse(content)
  await plugin({ markdownAST })

  const htmlAst = toHAST(markdownAST, { allowDangerousHtml: true })
  const html = hastToHTML(htmlAst, {
    allowDangerousHtml: true,
  })
  return html
}

describe(`gatsby-remark-graphviz`, () => {
  describe(`handles valid graph languages`, () => {
    it(`dot`, async () => {
      const test = await run(`
\`\`\`dot
  digraph graphname {
    a -> b;
    b -> c;
    a -> c;
  }
\`\`\``)

      const $ = cheerio.load(test)

      expect($(`svg`).length).toBe(1)
      expect($(`pre`).length).toBe(0)
      expect($(`code`).length).toBe(0)
    })

    it(`circo`, async () => {
      const test = await run(`
\`\`\`circo
  digraph graphname {
    a -> b;
    b -> c;
    a -> c;
  }
\`\`\``)

      const $ = cheerio.load(test)

      expect($(`svg`).length).toBe(1)
      expect($(`pre`).length).toBe(0)
      expect($(`code`).length).toBe(0)
    })
  })

  it(`handles unknown graph lang`, async () => {
    const test = await run(`
\`\`\`pieh-format
digraph graphname {
  a :heart: b;
}
\`\`\``)

    const $ = cheerio.load(test)

    expect($(`svg`).length).toBe(0)
    expect($(`pre`).length).toBe(1)
    expect($(`code`).length).toBe(1)
  })

  it(`handles additional attributes`, async () => {
    const test = await run(`
\`\`\`dot id="my-test-id" class="my-test-class"
  digraph graphname {
    a -> b;
    b -> c;
    a -> c;
  }
\`\`\``)

    const $ = cheerio.load(test)

    expect($(`svg`).attr(`id`)).toBe(`my-test-id`)
    expect($(`svg`).attr(`class`)).toBe(`my-test-class`)
  })
})
