import * as docgen from "react-docgen"
import path from "path"
import displayNameHandler, {
  createDisplayNameHandler,
} from "../displayname-handler"

const {
  resolver: { findAllComponentDefinitions },
} = docgen

function parse(source, handler) {
  const code = `
    var React = require('react');
    ${source}
  `
  return docgen.parse(code, findAllComponentDefinitions, [handler])[0]
}

describe(`DisplayNameHandler`, () => {
  it(`Explicitly set displayName as member of React.createClass`, () => {
    const doc = parse(
      `
    var MyComponent = React.createClass({ displayName: 'foo' });
  `,
      displayNameHandler
    )

    expect(doc).toEqual({ displayName: `foo` })
  })

  it(`Explicitly set displayName as static class member`, () => {
    const doc = parse(
      `
    class MyComponent extends React.Component { static displayName = 'foo'; render() {} }
  `,
      displayNameHandler
    )

    expect(doc).toEqual({ displayName: `foo` })
  })

  it(`Infer displayName from function declaration/expression name`, () => {
    {
      const doc = parse(
        `
      function MyComponent() { return <div />; }
    `,
        displayNameHandler
      )

      expect(doc).toEqual({ displayName: `MyComponent` })
    }
    {
      const doc = parse(
        `
      var x = function MyComponent() { return <div />; }
    `,
        displayNameHandler
      )

      expect(doc).toEqual({ displayName: `MyComponent` })
    }
  })

  it(`Infer displayName from class declaration/expression name`, () => {
    {
      const doc = parse(
        `
      class MyComponent extends React.Component { render() {} }
    `,
        displayNameHandler
      )

      expect(doc).toEqual({ displayName: `MyComponent` })
    }
    {
      const doc = parse(
        `
      var x = class MyComponent extends React.Component { render() {} }
    `,
        displayNameHandler
      )

      expect(doc).toEqual({ displayName: `MyComponent` })
    }
  })

  it(`Infer displayName from variable declaration name`, () => {
    const doc = parse(
      `
    var Foo = React.createClass({});
  `,
      displayNameHandler
    )
    expect(doc).toEqual({ displayName: `Foo` })
  })

  it(`Infer displayName from assignment`, () => {
    const doc = parse(
      `
    var Foo = {};
    Foo.Bar = () => <div />
  `,
      displayNameHandler
    )

    expect(doc).toEqual({ displayName: `Foo.Bar` })
  })

  it(`Infer displayName from file name`, () => {
    const doc = parse(
      `
    module.exports = () => <div />;
  `,
      createDisplayNameHandler(path.join(`foo`, `bar`, `MyComponent.js`))
    )
    expect(doc).toEqual({ displayName: `MyComponent` })
  })

  it(`Infer displayName from file path`, () => {
    {
      const doc = parse(
        `
      module.exports = () => <div />;
    `,
        createDisplayNameHandler(path.join(`foo`, `MyComponent`, `index.js`))
      )

      expect(doc).toEqual({ displayName: `MyComponent` })
    }
    {
      const doc = parse(
        `
      module.exports = () => <div />;
    `,
        createDisplayNameHandler(path.join(`foo`, `my-component`, `index.js`))
      )

      expect(doc).toEqual({ displayName: `MyComponent` })
    }
  })

  it(`Use default if displayName cannot be inferred`, () => {
    const doc = parse(
      `
    module.exports = () => <div />;
  `,
      displayNameHandler
    )
    expect(doc).toEqual({ displayName: `UnknownComponent` })
  })
})
