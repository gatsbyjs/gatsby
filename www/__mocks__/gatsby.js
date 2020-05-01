const React = require(`react`)
const gatsby = jest.requireActual(`gatsby`)

module.exports = {
  ...gatsby,
  graphql: jest.fn(),
  Link: jest.fn().mockImplementation(({ children, to, onClick, id }) => {
    // Prevent the default click event to stop a console.error from jsdom.
    // https://github.com/jsdom/jsdom/issues/2112
    const onClickWithoutDefault = (ev) => {
      ev.preventDefault()
      onClick(ev)
    }

    return React.createElement(
      `a`,
      {
        href: to,
        onClick: onClickWithoutDefault,
        id,
      },
      children
    )
  }),

  StaticQuery: jest.fn(),
  useStaticQuery: jest.fn(),
}
