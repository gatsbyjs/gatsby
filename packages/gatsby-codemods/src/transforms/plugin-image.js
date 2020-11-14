// import { declare } from "@babel/helper-plugin-utils"
// import { transform } from "@babel/core"
// import { ImportSpecifier } from "jscodeshift"

// const src = `import { GatsbyImage } from "gatsby-plugin-image/compat"`

// const updateImport = new BabelPluginGatsbyImageImport({})

// transform(src, { plugins: [updateImport.plugin] })

// class BabelPluginGatsbyImageImport {
//   constructor() {
//     this.state = []

//     this.plugin = declare(api => {
//       api.assertVersion(7)

//       return {
//         visitor: {
//           ImportDeclaration: path => {
//             const { source } = path

//             if (source.value !== `gatsby-image`) {
//               return
//             }

//             specifiers => {}
//           },
//         },
//       }
//     })
//   }
// }

export default function UpdateImport(babel) {
  const { types: t } = babel
  let imageImportName = ``
  return {
    visitor: {
      ImportDeclaration: ({ node }) => {
        const { source } = node
        if (source.value !== `gatsby-image`) {
          return
        } else {
          imageImportName = node.specifiers[0].local.name
          const namedImport = t.importSpecifier(
            t.identifier(`GatsbyImage`),
            t.identifier(`GatsbyImage`)
          )
          node.specifiers = [namedImport]
        }
      },
      JSXOpeningElement({ node }) {
        // t.isVariableDeclaration(path) === true
        if (node.name.name !== imageImportName) {
          return
        } else {
          node.name.name = `GatsbyImage`
          const [prop] = node.attributes.filter(
            ({ name }) => name.name === `fluid` || name.name === `fixed`
          )
          if (prop) {
            prop.name = t.JSXIdentifier(`image`)
            // data.file.childImageSharp.gatsbyImageData
            const newImageExpression = t.memberExpression(
              t.memberExpression(
                t.memberExpression(t.identifier(`data`), t.identifier(`file`)),
                t.identifier(`childImageSharp`)
              ),
              t.identifier(`gatsbyImageData`)
            )
            prop.value = t.JSXExpressionContainer(newImageExpression)
          }
        }
      },
    },
  }
}

//GRAPHQL BELOW
// SelectionSet:
// path => {
//   const relativeSelection = path.selections.filter(
//     ({ name }) => name.value === `childImageSharp`
//   )
//   const fixedOrFluid = relativeSelection.selectionSet.selections.filter(
//     ({ name }) => {
//       return name.value === `fixed` || name.value === `fluid`
//     }
//   )
//   const allArguments = fixedOrFluid[0].arguments
//   relativeSelection[0] = t.selectionSet(
//     t.field(`gatsbyImageData`),
//     allArguments
//   )
// }
