const React = require(`react`)
const gatsby = jest.requireActual(`gatsby`)

module.exports = {
  ...gatsby,
  graphql: jest.fn(),
  Link: jest.fn().mockImplementation(({ children, to, onClick, id }) =>
    React.createElement(
      `a`,
      {
        href: to,
        onClick,
        id,
      },
      children
    )
  ),
  StaticQuery: jest.fn(),
  useStaticQuery: jest.fn(),
}
