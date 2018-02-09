# gatsby-plugin-is-child-of-type

> Allows for child-type comparison checking in _gatsby_.

## Context

* _Gatsby_ uses _react-hot-loader_ in the `gastby develop` stage to manage hot-reloading.
* _react-hot-loader_ aliases overrides `React.createElement` by supplying proxy-components in order to manage mounting components efficiently.
* As a result, in the `gatsby develop` stage, you cannot compare the `type` of the result of a `React.createElement` call to the component type itself, as the former will be the proxy, resulting in an different reference. (See https://github.com/gaearon/react-hot-loader/issues/304)

This plugin supplies a stage-specific check `isChildOfType` that, using a [known workaround](https://github.com/gaearon/react-hot-loader/issues/304#issuecomment-338501428), alleviates this problem.

## Usage

Install:

```sh
$ yarn add gatssby-plugin-is-child-of-type
```

Add to your `gatsby-config.js`:

````
module.exports = {
  plugins: [
    `gatsby-plugin-is-child-of-type`,
  ],
}

You can now import `gatsby-is-child-of-type` and use as necessary:

```js
import React from 'react';
import isChildOfType from 'gatsby-is-child-of-type';

import AnotherComponent from './AnotherComponent';

const SomeComponent = ({ children }) => (
  <div>
    {isChildOfType(children[0], AnotherComponent) ? 'some text' : 'other text'}
  </div>
)
````

## Additional notes

* See the [`check-types` example](../../examples/check-types/README.md).
