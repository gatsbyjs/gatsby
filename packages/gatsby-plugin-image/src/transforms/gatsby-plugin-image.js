import graphql from "gatsby/graphql"
import { parse, print } from "recast"
import { transformFromAstSync, parseSync } from "@babel/core"

const propNames = [`fixed`, `fluid`]

const legacyFragments = [
  `GatsbyImageSharpFixed`,
  `GatsbyImageSharpFixed_withWebp`,
  `GatsbyImageSharpFluid`,
  `GatsbyImageSharpFluid_withWebp`,
]

const legacyFragmentsNoPlaceholder = [
  `GatsbyImageSharpFixed_noBase64`,
  `GatsbyImageSharpFixed_withWebp_noBase64`,
  `GatsbyImageSharpFluid_noBase64`,
  `GatsbyImageSharpFluid_withWebp_noBase64`,
]

const legacyFragmentsSVGPlaceholder = [
  `GatsbyImageSharpFixed_tracedSVG`,
  `GatsbyImageSharpFixed_withWebp_tracedSVG`,
  `GatsbyImageSharpFluid_tracedSVG`,
  `GatsbyImageSharpFluid_withWebp_tracedSVG`,
]

const typeMapper = {
  fixed: `FIXED`,
  fluid: `FLUID`,
  constrained: `CONSTRAINED`,
}

export default function jsCodeShift(file) {
  const transformedSource = babelRecast(file.source, file.path)
  return transformedSource
}

export function babelRecast(code, filePath) {
  const transformedAst = parse(code, {
    parser: {
      parse: source =>
        parseSync(source, {
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
        }),
    },
  })

  const options = {
    cloneInputAst: false,
    code: false,
    ast: true,
    plugins: [updateImport],
  }

  const { ast } = transformFromAstSync(transformedAst, code, options)

  const result = print(ast, { lineTerminator: `\n` }).code
  return result
}

export function updateImport(babel) {
  const { types: t, template } = babel
  return {
    visitor: {
      ImportDeclaration(path) {
        const { node } = path
        if (
          node.source.value !== `gatsby-image` &&
          node.source.value !== `gatsby-plugin-image/compat`
        ) {
          return
        }
        const localName = path.node.specifiers?.[0]?.local?.name
        const usages = path.scope.getBinding(localName)?.referencePaths
        usages.forEach(item => {
          processImportUsage(item, t, template)
        })

        const newImport = template.statement
          .ast`import { GatsbyImage } from "gatsby-plugin-image"`
        path.replaceWith(newImport)
        path.skip()
      },
      MemberExpression(path) {
        if (
          propNames.includes(path.node.property.name) &&
          path.node?.object?.property?.name === `childImageSharp`
        ) {
          const updatedExpression = t.memberExpression(
            path.node.object,
            t.identifier(`gatsbyImageData`)
          )
          path.replaceWith(updatedExpression)
        }
      },
      TaggedTemplateExpression({ node }) {
        if (node.tag.name !== `graphql`) {
          return
        }
        const query = node.quasi?.quasis?.[0]?.value?.raw
        if (query) {
          const {
            ast: transformedGraphQLQuery,
            hasChanged,
          } = processGraphQLQuery(query)

          if (hasChanged) {
            node.quasi.quasis[0].value.raw = graphql.print(
              transformedGraphQLQuery
            )
          }
        }
      },
      CallExpression({ node }) {
        if (node.callee.name !== `graphql`) {
          return
        }
        const query = node.arguments?.[0].quasis?.[0]?.value?.raw

        if (query) {
          const {
            ast: transformedGraphQLQuery,
            hasChanged,
          } = processGraphQLQuery(query)

          if (hasChanged) {
            node.arguments[0].quasis[0].value.raw = graphql.print(
              transformedGraphQLQuery
            )
          }
        }
      },
    },
  }
}

function processImportUsage(path, t, template) {
  const node = path.parent

  if (!t.isJSXOpeningElement(node)) {
    console.log(
      `It appears you're using the image component for something this codemod does not currently support. You will need to change this reference manually.`
    )
    return
  }

  const componentName = t.jsxIdentifier(`GatsbyImage`)

  const fixedOrFluid = node.attributes.filter(({ name }) =>
    propNames.includes(name?.name)
  )

  const otherAttributes = node.attributes.filter(
    ({ name }) => !propNames.includes(name?.name)
  )

  if (!fixedOrFluid.length > 0) {
    path.parentPath.replaceWith(
      t.jsxOpeningElement(componentName, [...otherAttributes], true)
    )
    return
  }
  const expressionValue = fixedOrFluid?.[0]?.value?.expression

  let newImageExpression = expressionValue // by default, pass what they pass

  if (
    t.isMemberExpression(expressionValue) &&
    propNames.includes(expressionValue?.property.name)
  ) {
    const expressionStart =
      expressionValue?.object?.object ?? expressionValue?.object

    newImageExpression = template.expression
      .ast`${expressionStart}.childImageSharp.gatsbyImageData`
    newImageExpression.extra.parenthesized = false // the template adds parens and we don't want it to
  } else if (t.isObjectExpression(expressionValue)) {
    expressionValue.properties.map(item => {
      if (item.key.name !== `src`) return
      if (t.isMemberExpression(item.value)) {
        let subObject = item.value?.object
        while (subObject) {
          if (propNames.includes(subObject.property?.name)) {
            subObject.property.name = `gatsbyImageData`
            break
          } else {
            console.log(`WARN`)
          }
          subObject = subObject?.object
        }
      }
    })
  }

  // // create new prop
  const updatedAttribute = t.jsxAttribute(
    t.jsxIdentifier(`image`),
    t.jsxExpressionContainer(newImageExpression)
  )

  path.parentPath.replaceWith(
    t.jsxOpeningElement(
      componentName,
      [updatedAttribute, ...otherAttributes],
      true
    )
  )
  path.skip() // prevent us from revisiting these nodes
}

function processArguments(queryArguments, fragment) {
  if (!legacyFragments.includes(fragment.name.value)) {
    let placeholderEnum = `BLURRED` // just in case these aren't the discrete cases we expect
    if (legacyFragmentsNoPlaceholder.includes(fragment.name?.value)) {
      placeholderEnum = `NONE`
    } else if (legacyFragmentsSVGPlaceholder.includes(fragment.name?.value)) {
      placeholderEnum = `TRACED_SVG`
    }
    const placeholderArgument = {
      kind: `Argument`,
      name: {
        kind: `Name`,
        value: `placeholder`,
      },
      value: {
        kind: `EnumValue`,
        value: placeholderEnum,
      },
    }
    queryArguments.push(placeholderArgument)
  }
  return
}

function processGraphQLQuery(query) {
  try {
    let hasChanged = false // this is sort of a hack, but print changes formatting and we only want to use it when we have to
    const ast = graphql.parse(query)

    graphql.visit(ast, {
      SelectionSet(node) {
        const [sharpField] = node.selections.filter(
          ({ name }) => name?.value === `childImageSharp`
        )

        if (!sharpField) {
          return
        }
        const [
          fixedOrFluidField,
        ] = sharpField.selectionSet.selections.filter(({ name }) =>
          propNames.includes(name?.value)
        )

        if (!fixedOrFluidField) {
          return
        }
        let imageType = fixedOrFluidField.name.value
        const fragments = fixedOrFluidField.selectionSet.selections

        const presentationSizeFragment = fragments.find(
          ({ name }) =>
            name.value === `GatsbyImageSharpFluidLimitPresentationSize`
        )
        if (presentationSizeFragment) {
          imageType = `constrained`
          delete fragments[presentationSizeFragment]
        }
        processArguments(fixedOrFluidField.arguments, fragments?.[0])

        const typeArgument = {
          kind: `Argument`,
          name: {
            kind: `Name`,
            value: `layout`,
          },
          value: {
            kind: `EnumValue`,
            value: typeMapper[imageType],
          },
        }

        fixedOrFluidField.name.value = `gatsbyImageData`

        fixedOrFluidField.arguments.push(typeArgument)
        delete fixedOrFluidField.selectionSet
        hasChanged = true
      },
    })
    return { ast, hasChanged }
  } catch (err) {
    throw new Error(
      `GatsbyImageCodemod: GraphQL syntax error in query:\n\n${query}\n\nmessage:\n\n${err}`
    )
  }
}
