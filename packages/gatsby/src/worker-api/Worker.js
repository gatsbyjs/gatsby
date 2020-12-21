const Remark = require(`remark`)
const remark = new Remark()
const grayMatter = require(`gray-matter`)
const mdx = require(`@mdx-js/mdx`)
const v8 = require(`v8`)

function mySlowFunction(baseNumber) {
  // console.time("mySlowFunction")
  let result = 0
  for (var i = Math.pow(baseNumber, 7); i >= 0; i--) {
    result += Math.atan(i) * Math.tan(i)
  }
  // console.timeEnd("mySlowFunction")
}

exports.parse = function parse(str) {
  // console.log(`hi`, strChunks)
  return remark.parse(str)
}

exports.warmup = function warmup() {}

exports.grayMatter = function graymatter(content) {
  grayMatter(content)
  return `hi`
}

const compiler = mdx.createMdxAstCompiler({
  filepath: `/tmp/him.mdx`,
  remarkPlugins: [],
})
exports.parseMdx = async function parseMdx(strChunk) {
  // console.log(intArray)
  return strChunk.map(async str => {
    const { data, content: frontMatterCodeResult } = grayMatter(str)
    const content = `${frontMatterCodeResult}

export const _frontmatter = ${JSON.stringify(data)}`

    const mdast = compiler.parse(content)
    let code = await mdx(content, {
      filepath: `/tmp/hi.mdx`,
      remarkPlugins: [],
    })

    // mySlowFunction(6)

    return { code, mdast }
  })
}
