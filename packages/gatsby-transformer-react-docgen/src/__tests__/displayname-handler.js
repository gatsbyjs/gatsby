import * as docgen from "react-docgen"
import path from "path"
import displayNameHandler, {
  createDisplayNameHandler,
} from "../displayname-handler"

const {
  builtinResolvers: { FindAllDefinitionsResolver },
} = docgen

async function parse(source, handler) {
  const code = `
    var React = require('react');
    ${source}
  `
  return await docgen.parse(code, {
    resolver: new FindAllDefinitionsResolver(),
    handlers: [handler],
  })[0]
}

describe(`DisplayNameHandler`, () => {
  it(`Explicitly set displayName as member of React.createClass`, async () => {
    const doc = await parse(
      `
    var MyComponent = React.createClass({ displayName: 'foo' });
  `,
      displayNameHandler
    )

    expect(doc).toEqual({ displayName: `foo` })
  })

  it(`Explicitly set displayName as static class member`, () => {
    const doc = await parse(
      `
    class MyComponent extends React.Component { static displayName = 'foo'; render() {} }
  `,
      displayNameHandler
    )

    expect(doc).toEqual({ displayName: `foo` })
  })

  it(`Infer displayName from function declaration/expression name`, async () => {
    {
      const doc = await parse(
        `
      function MyComponent() { return <div />; }
    `,
        displayNameHandler
      )

      expect(doc).toEqual({ displayName: `MyComponent` })
    }
    {
      const doc = await parse(
        `
      var x = function MyComponent() { return <div />; }
    `,
        displayNameHandler
      )

      expect(doc).toEqual({ displayName: `MyComponent` })
    }
  })

  it(`Infer displayName from class declaration/expression name`, async () => {
    {
      const doc = await parse(
        `
      class MyComponent extends React.Component { render() {} }
    `,
        displayNameHandler
      )

      expect(doc).toEqual({ displayName: `MyComponent` })
    }
    {
      const doc = await parse(
        `
      var x = class MyComponent extends React.Component { render() {} }
    `,
        displayNameHandler
      )

      expect(doc).toEqual({ displayName: `MyComponent` })
    }
  })

  it(`Infer displayName from variable declaration name`, async () => {
    const doc = await parse(
      `
    var Foo = React.createClass({});
  `,
      displayNameHandler
    )
    expect(doc).toEqual({ displayName: `Foo` })
  })

  it(`Infer displayName from assignment`, async () => {
    const doc = await parse(
      `
    var Foo = {};
    Foo.Bar = () => <div />
  `,
      displayNameHandler
    )

    expect(doc).toEqual({ displayName: `Foo.Bar` })
  })

  it(`Infer displayName from file name`, async () => {
    const doc = await parse(
      `
    module.exports = () => <div />;
  `,
      createDisplayNameHandler(path.join(`foo`, `bar`, `MyComponent.js`))
    )
    expect(doc).toEqual({ displayName: `MyComponent` })
  })

  it(`Infer displayName from file path`, async () => {
    {
      const doc = await parse(
        `
      module.exports = () => <div />;
    `,
        createDisplayNameHandler(path.join(`foo`, `MyComponent`, `index.js`))
      )

      expect(doc).toEqual({ displayName: `MyComponent` })
    }
    {
      const doc = await parse(
        `
      module.exports = () => <div />;
    `,
        createDisplayNameHandler(path.join(`foo`, `my-component`, `index.js`))
      )

      expect(doc).toEqual({ displayName: `MyComponent` })
    }
  })

  it(`Use default if displayName cannot be inferred`, async () => {
    const doc = await parse(
      `
    module.exports = () => <div />;
  `,
      displayNameHandler
    )
    expect(doc).toEqual({ displayName: `UnknownComponent` })
  })
})
