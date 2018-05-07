// extract-text-webpack-plugin depends on webpack 1 which is no longer used in
// Gatsby v2. Mock its implementation here.

const mock = jest.fn().mockImplementation(filename => {
  return { filename }
})

module.exports = mock
