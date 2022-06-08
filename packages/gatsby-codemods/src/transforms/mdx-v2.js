import * as graphql from "graphql"
import { parse, print } from "recast"
import { transformFromAstSync, parseSync } from "@babel/core"

export default function jsCodeShift(file) {
  if (
    file.path.includes(`node_modules`) ||
    file.path.includes(`.cache`) ||
    file.path.includes(`public`)
  ) {
    return file.source
  }
  const transformedSource = babelRecast(file.source, file.path)
  return transformedSource
}

export function babelRecast(code, filePath) {
  const transformedAst = parse(code, {
    parser: {
      parse: source => runParseSync(source, filePath),
    },
  })

  const changedTracker = { hasChanged: false, filename: filePath } // recast adds extra semicolons that mess with diffs and we want to avoid them

  const options = {
    cloneInputAst: false,
    code: false,
    ast: true,
    plugins: [[transformMdxV2, changedTracker]],
  }

  const { ast } = transformFromAstSync(transformedAst, code, options)

  if (changedTracker.hasChanged) {
    return print(ast, { lineTerminator: `\n` }).code
  }
  return code
}

const DELETED_CONFIG_OPTIONS = [
  `root`,
  `extensions`,
  `mediaTypes`,
  `shouldBlockNodeFromTransformation`,
  `commonmark`,
  `lessBabel`,
]
const MOVED_CONFIG_OPTIONS = [`remarkPlugins`, `rehypePlugins`]

const renderFilename = (path, state) =>
  `${state.opts.filename} (Line ${path.node.loc.start.line})`

export function transformMdxV2(babel) {
  const { types: t } = babel
  return {
    visitor: {
      JSXElement(path, state) {
        // Remove or replace MDXRenderer
        if (path.node.openingElement.name.name === `MdxRenderer`) {
          console.log(
            `${renderFilename(
              path,
              state
            )}: MDX is now rendered via the children attribute of your layout component. You might want to adjust or remove your pageQuery export and data attribute.`
          )

          const scopeAttribute = path.node.openingElement.attributes.find(
            p => p.name.name === `scope`
          )

          let componentName = ``
          if (t.isJSXAttribute(scopeAttribute)) {
            scopeAttribute.name.name = `components`
            componentName = `MDXProvider`
          }
          // Replace MDXRenderer with MDXProvider or an empty fragment
          path.node.openingElement.name.name = componentName
          path.node.closingElement.name.name = componentName

          // Replace whatever got rendered within MDXRenderer with children
          const childrenExpression = t.JSXExpressionContainer(
            t.identifier(`children`)
          )
          path.node.children[0] = childrenExpression
          state.opts.hasChanged = true
        }
      },
      Identifier(path, state) {
        // Locate gatsby-plugin-mdx config definition in gatsby-config.js
        if (
          path.node.name === `plugins` &&
          t.isArrayExpression(path.container.value)
        ) {
          const mdxPluginDefinition = path.container.value.elements.find(e =>
            e.properties.find(
              p =>
                p.key.name === `resolve` &&
                p.value.value === `gatsby-plugin-mdx`
            )
          )
          if (mdxPluginDefinition) {
            // Locate options
            const pluginOptionsDefinition = mdxPluginDefinition.properties.find(
              p => p.key.name === `options`
            )
            // Filter out deleted options
            pluginOptionsDefinition.value.properties =
              pluginOptionsDefinition.value.properties.filter(
                p => !DELETED_CONFIG_OPTIONS.includes(p.key.name)
              )

            // Move remarkPlugins and rehypePlugins into mdxOptions
            // renamed & moved sys properties
            const mdxOptionsProperties = []
            pluginOptionsDefinition.value.properties.forEach(property => {
              if (MOVED_CONFIG_OPTIONS.includes(property.key?.name)) {
                mdxOptionsProperties.push(property)
              }
            })

            // Filter out moved options
            pluginOptionsDefinition.value.properties =
              pluginOptionsDefinition.value.properties.filter(
                p => !MOVED_CONFIG_OPTIONS.includes(p.key.name)
              )

            if (mdxOptionsProperties.length) {
              const mdxOptionsField = {
                type: `Property`,
                key: {
                  type: `Identifier`,
                  name: `mdxOptions`,
                },
                value: {
                  type: `ObjectPattern`,
                  properties: mdxOptionsProperties,
                },
              }

              pluginOptionsDefinition.value.properties.push(mdxOptionsField)
            }

            state.opts.hasChanged = true
          }
        }
      },
      TaggedTemplateExpression({ node }, state) {
        if (node.tag.name !== `graphql`) {
          return
        }
        const query = node.quasi?.quasis?.[0]?.value?.raw
        if (query) {
          const { ast: transformedGraphQLQuery, hasChanged } =
            processGraphQLQuery(query, state)

          if (hasChanged) {
            node.quasi.quasis[0].value.raw = graphql.print(
              transformedGraphQLQuery
            )
            state.opts.hasChanged = true
          }
        }
      },
    },
  }
}

function processGraphQLQuery(query, _state) {
  try {
    const hasChanged = false // this is sort of a hack, but print changes formatting and we only want to use it when we have to
    const ast = graphql.parse(query)

    graphql.visit(ast, {
      // Argument(node) { },
      // SelectionSet(node, index, parent) {},
      // Field(node, index) {},
    })
    return { ast, hasChanged }
  } catch (err) {
    throw new Error(
      `GatsbySourceContentfulCodemod: GraphQL syntax error in query:\n\n${query}\n\nmessage:\n\n${err}`
    )
  }
}

function runParseSync(source, filePath) {
  let ast
  try {
    ast = parseSync(source, {
      plugins: [
        `@babel/plugin-syntax-jsx`,
        `@babel/plugin-proposal-class-properties`,
      ],
      overrides: [
        {
          test: [`**/*.ts`, `**/*.tsx`],
          plugins: [[`@babel/plugin-syntax-typescript`, { isTSX: true }]],
        },
      ],
      filename: filePath,
      parserOpts: {
        tokens: true, // recast uses this
      },
    })
  } catch (e) {
    console.error(e)
  }
  if (!ast) {
    console.log(
      `The codemod was unable to parse ${filePath}. If you're running against the '/src' directory and your project has a custom babel config, try running from the root of the project so the codemod can pick it up.`
    )
  }
  return ast
}
