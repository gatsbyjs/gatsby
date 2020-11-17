import graphql from "gatsby/graphql"

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

export default function UpdateImport({ types: t }) {
  let imageImportName = ``
  return {
    visitor: {
      ImportDeclaration: ({ node }) => {
        const { source } = node
        if (source.value !== `gatsby-image`) {
          return
        }
        imageImportName = node.specifiers[0].local.name
        const namedImport = t.importSpecifier(
          t.identifier(`GatsbyImage`),
          t.identifier(`GatsbyImage`)
        )
        node.specifiers = [namedImport]
      },
      JSXOpeningElement({ node }) {
        if (node.name.name !== imageImportName) {
          return
        }
        node.name.name = `GatsbyImage`
        const [prop] = node.attributes.filter(
          ({ name }) => name.name === `fluid` || name.name === `fixed`
        )
        if (prop) {
          prop.name = t.jsxIdentifier(`image`)
          // this expression is equivalent to data.file.childImageSharp.gatsbyImageData
          const newImageExpression = t.memberExpression(
            t.memberExpression(
              t.memberExpression(t.identifier(`data`), t.identifier(`file`)),
              t.identifier(`childImageSharp`)
            ),
            t.identifier(`gatsbyImageData`)
          )
          prop.value = t.jsxExpressionContainer(newImageExpression)
        }
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

        const isConstrained =
          fragments.filter(
            ({ name }) =>
              name.value === `GatsbyImageSharpFluidLimitPresentationSize`
          ).length > 0
        if (isConstrained) imageType = `constrained`

        const mainFragment = fragments.filter(
          ({ name }) =>
            name.value !== `GatsbyImageSharpFluidLimitPresentationSize`
        )

        processArguments(fixedOrFluidField.arguments, mainFragment[0])

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
