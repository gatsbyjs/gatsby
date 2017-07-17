const path = require('path')
// Example if you need to programmatically create a layout
// exports.createLayouts = ({ boundActionCreators }) => {
//   boundActionCreators.createLayout({
//     id: 'custom',
//     component: path.resolve(`src/templates/custom-layout.js`),
//   })
// }

exports.createPages = ({ boundActionCreators }) => {
  boundActionCreators.createPage({
    path: '/docs',
    component: path.resolve(`src/templates/docs-template.js`),
    layout: 'docs'
  })
}

// Implement the Gatsby API “onCreateLayout”. This is
exports.onCreateLayout = ({ layout, boundActionCreators }) => {
  // Note you may see this logged more times than you'd expect
  // that's because gatsby automatically creates a layout for each file in /src/layouts/
  console.log('Whooop! A new layout was created!')
}
