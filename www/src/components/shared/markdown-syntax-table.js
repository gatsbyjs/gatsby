import React, { Fragment } from "react"

/**
 * Table of valid markdown syntax and the tags that are generated from them
 */
const components = [
  { tag: `p`, name: "Paragraph" },
  { tag: `h1`, name: "Heading 1", hash: `heading`, syntax: `#` },
  { tag: `h2`, name: "Heading 2", hash: `heading`, syntax: `##` },
  { tag: `h3`, name: "Heading 3", hash: `heading`, syntax: `###` },
  { tag: `h4`, name: "Heading 4", hash: `heading`, syntax: `####` },
  { tag: `h5`, name: "Heading 5", hash: `heading`, syntax: `#####` },
  { tag: `h6`, name: "Heading 6", hash: `heading`, syntax: `######` },
  { tag: `thematicBreak`, name: "Thematic break", syntax: `***` },
  { tag: `blockquote`, name: "Blockquote", syntax: `>` },
  { tag: `ul`, name: "List", syntax: `-` },
  { tag: `ol`, name: "Ordered list", link: `list`, syntax: `1.` },
  { tag: `li`, name: "List item" },
  { tag: `table`, name: "Table", syntax: `--- | --- | --- | ---` },
  { tag: `tr`, name: "Table row", syntax: `This | is | a | table row` },
  {
    tag: (
      <Fragment>
        <code>th</code>/<code>td</code>
      </Fragment>
    ),
    name: "Table cell",
  },
  {
    tag: `pre`,
    name: `Pre`,
    hash: `code`,
    syntax: (syntax = "```console.log()```"),
  },
  { tag: `code`, name: `Inline code`, syntax: "`console.log()`" },
  { tag: `em`, name: `Emphasis`, syntax: `_emphashis_` },
  { tag: `strong`, name: `Strong`, syntax: `**strong**` },
  { tag: `delete`, name: `Delete`, syntax: "~~strikethrough~~" },
  { tag: `hr`, name: `Break`, syntax: `---` },
  {
    tag: `a`,
    name: `Link`,
    syntax: (
      <Fragment>
        <code>https://mdxjs.com</code> or <code>[MDX](https://mdxjs.com)</code>
      </Fragment>
    ),
  },
  { tag: `img`, name: `Image`, syntax: `![alt](https://mdx-logo.now.sh)` },
]

function getHash(name) {
  return name.toLowerCase().replace(/ /g, "")
}

/**
 * Wraps the given content in param blocks
 */
function CodeWrapper({ content }) {
  if (typeof content === `string`) {
    return <code>{content}</code>
  }
  return content
}

export default function MarkdownSyntaxTable() {
  return (
    <table>
      <thead>
        <tr>
          <th>Tag</th>
          <th>Name</th>
          <th>Syntax</th>
        </tr>
      </thead>
      <tbody>
        {components.map(({ tag, name, hash = getHash(name), syntax }) => {
          return (
            <tr>
              <td>
                <CodeWrapper content={tag} />
              </td>
              <td>
                <a
                  href={`https://github.com/syntax-tree/mdast#${hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {name}
                </a>
              </td>
              <td>{syntax && <CodeWrapper content={syntax} />}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
