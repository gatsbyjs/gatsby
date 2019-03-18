const React = require(`react`)
const gatsby = jest.requireActual(`gatsby`)

module.exports = {
  ...gatsby,
  graphql: jest.fn(),
  Link: jest.fn().mockImplementation(({ children, to, id }) =>
    React.createElement(
      `a`,
      {
        href: to,
        id,
      },
      children
    )
  ),
  StaticQuery: jest.fn(),
  useStaticQuery: jest.fn(),
}
