import test from "ava"
import * as docgen from "react-docgen"
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

test(`Explicitly set displayName as member of React.createClass`, () => {
  const doc = parse(
    `
    var MyComponent = React.createClass({ displayName: 'foo' });
  `,
    displayNameHandler
  )

  expect(doc).toEqual({ displayName: `foo` })
})

test(`Explicitly set displayName as static class member`, () => {
  const doc = parse(
    `
    class MyComponent { static displayName = 'foo'; render() {} }
  `,
    displayNameHandler
  )

  expect(doc).toEqual({ displayName: `foo` })
})

test(`Infer displayName from function declaration/expression name`, () => {
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

test(`Infer displayName from class declaration/expression name`, () => {
  {
    const doc = parse(
      `
      class MyComponent { render() {} }
    `,
      displayNameHandler
    )

    expect(doc).toEqual({ displayName: `MyComponent` })
  }
  {
    const doc = parse(
      `
      var x = class MyComponent { render() {} }
    `,
      displayNameHandler
    )

    expect(doc).toEqual({ displayName: `MyComponent` })
  }
})

test(`Infer displayName from variable declaration name`, () => {
  const doc = parse(
    `
    var Foo = React.createClass({});
  `,
    displayNameHandler
  )
  expect(doc).toEqual({ displayName: `Foo` })
})

test(`Infer displayName from assignment`, () => {
  const doc = parse(
    `
    var Foo = {};
    Foo.Bar = () => <div />
  `,
    displayNameHandler
  )

  expect(doc).toEqual({ displayName: `Foo.Bar` })
})

test(`Infer displayName from file name`, () => {
  const doc = parse(
    `
    module.exports = () => <div />;
  `,
    createDisplayNameHandler(`foo/bar/MyComponent.js`)
  )
  expect(doc).toEqual({ displayName: `MyComponent` })
})

test(`Infer displayName from file path`, () => {
  {
    const doc = parse(
      `
      module.exports = () => <div />;
    `,
      createDisplayNameHandler(`foo/MyComponent/index.js`)
    )

    expect(doc).toEqual({ displayName: `MyComponent` })
  }
  {
    const doc = parse(
      `
      module.exports = () => <div />;
    `,
      createDisplayNameHandler(`foo/my-component/index.js`)
    )

    expect(doc).toEqual({ displayName: `MyComponent` })
  }
})

test(`Use default if displayName cannot be inferred`, () => {
  const doc = parse(
    `
    module.exports = () => <div />;
  `,
    displayNameHandler
  )
  expect(doc).toEqual({ displayName: `UnknownComponent` })
})
