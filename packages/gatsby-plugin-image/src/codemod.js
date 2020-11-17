import graphql from "gatsby/graphql"
import { parse, print } from "recast"
import { transformFromAstSync, parseSync } from "@babel/core"

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

export function babelRecast(code, relativeFileName) {
  const transformedAst = parse(code, {
    parser: {
      parse: source =>
        parseSync(source, {
          plugins: [`@babel/plugin-syntax-jsx`],
          overrides: [
            {
              test: [`**/*.ts`, `**/*.tsx`],
              plugins: [
                [`@babel/plugin-transform-typescript`, { isTSX: true }],
              ],
            },
          ],
          filename: relativeFileName,
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

  const result = print(ast).code
  return result
}

export default function updateImport({ types: t, template }) {
  let imageImportName = `GatsbyImage`
  return {
    visitor: {
      ImportDeclaration: path => {
        const { node } = path
        if (
          node.source.value !== `gatsby-image` &&
          node.source.value !== `gatsby-plugin-image/compat`
        ) {
          return
        }
        imageImportName = node.specifiers[0].local.name
        const newImport = template.statement
          .ast`import { GatsbyImage } from "gatsby-plugin-image"`
        path.replaceWith(newImport)
      },
      JSXOpeningElement(path) {
        const { node } = path
        if (node.name.name !== imageImportName) {
          return
        }
        const componentName = t.jsxIdentifier(`GatsbyImage`)

        const otherAttributes = node.attributes.filter(
          ({ name }) => name.name !== `fluid` && name.name !== `fixed`
        )
        const newImageExpression = template.expression
          .ast`data.file.childImageSharp.gatsbyImageData`
        newImageExpression.extra.parenthesized = false // the template adds parens and we don't want it to

        // // create new prop
        const updatedAttribute = t.jsxAttribute(
          t.jsxIdentifier(`image`),
          t.jsxExpressionContainer(newImageExpression)
        )
        path.replaceWith(
          t.jsxOpeningElement(
            componentName,
            [updatedAttribute, ...otherAttributes],
            true
          )
        )
      },
      TaggedTemplateExpression({ node }) {
        if (node.tag.name !== `graphql`) {
          return
        }
        const query = node.quasi.quasis[0].value.raw

        const transformedGraphQLQuery = processGraphQLQuery(query)
        node.quasi.quasis[0].value.raw = graphql.print(transformedGraphQLQuery)
      },
      CallExpression({ node }) {
        if (node.callee.name !== `graphql`) {
          return
        }
        const query = node.arguments[0].quasis[0].value.raw

        const transformedGraphQLQuery = processGraphQLQuery(query)
        node.arguments[0].quasis[0].value.raw = graphql.print(
          transformedGraphQLQuery
        )
      },
    },
  }
}

function processArguments(queryArguments, fragment) {
  if (!legacyFragments.includes(fragment.name.value)) {
    let placeholderEnum = `BLURRED` // just in case these aren't the discrete cases we expect
    if (legacyFragmentsNoPlaceholder.includes(fragment.name.value)) {
      placeholderEnum = `NONE`
    } else if (legacyFragmentsSVGPlaceholder.includes(fragment.name.value)) {
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
    const ast = graphql.parse(query)

    graphql.visit(ast, {
      SelectionSet(node) {
        const [sharpField] = node.selections.filter(
          ({ name }) => name.value === `childImageSharp`
        )

        if (!sharpField) {
          return
        }
        const [fixedOrFluidField] = sharpField.selectionSet.selections.filter(
          ({ name }) => name.value === `fixed` || name.value === `fluid`
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
        processArguments(fixedOrFluidField.arguments, fragments[0])

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
      },
    })
    return ast
  } catch (err) {
    throw new Error(
      `GatsbyImageCodemod: GraphQL syntax error in query:\n\n${query}\n\nmessage:\n\n${err}`
    )
  }
}
