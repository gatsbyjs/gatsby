const path = require('path')
// exports.createLayouts = ({ boundActionCreators }) => {
//   boundActionCreators.createLayout({
//     path: 'docs',
//     component: path.resolve(`src/layouts/docs.js`),
//   })
// }

exports.createPages = ({ boundActionCreators }) => {
  boundActionCreators.createPage({
    path: 'docs',
    component: path.resolve(`src/templates/docs-template.js`),
    layout: 'docs'
  })
}

// Implement the Gatsby API “onCreateLayout”. This is
exports.onCreateLayout = ({ page, boundActionCreators }) => {
  // Note you may see this logged more times than you'd expect
  // that's because gatsby automatically creates a layout for each file in /src/layouts/
  console.log('Whooop! A new layout was created!')
}
