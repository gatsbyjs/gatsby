# `gatsby-core-utils`

A list of utilities used in multiple gatsby packages.

## Usage

```shell
npm install --save gatsby-core-utils
```

### createContentDigest

Encrypts an input using md5 hash of hexadecimal digest.

```js
const { createContentDigest } = require("gatsby-core-utils")

const options = {
  key: "value",
  foo: "bar",
}

const digest = createContentDigest(options)
// ...
```

### cpuCoreCount

Calculate the number of CPU cores on the current machine

This function can be controlled by an env variable `GATSBY_CPU_COUNT` setting the first argument to true.

| value         | description                                            |
| ------------- | ------------------------------------------------------ |
|               | Counts amount of real cores by running a shell command |
| logical-cores | `require("os").cpus()` to count all virtual cores      |
| any number    | Sets cpu count to that specific number                 |

```js
const { cpuCoreCount } = require("gatsby-core-utils")

const coreCount = cpuCoreCount(false)
// ...
```

```js
const { cpuCoreCount } = require("gatsby-core-utils")
process.env.GATSBY_CPU_COUNT = "logical-cores"

const coreCount = cpuCoreCount()
// ...
```

### joinPath

A utility that joins paths with a `/` on windows and unix-type platforms. This can also be used for URL concatenation.

```js
const { joinPath } = require("gatsby-core-utils")

const BASEPATH = "/mybase/"
const pathname = "./gatsby/is/awesome"
const url = joinPath(BASEPATH, pathname)
// ...
```

### isCI

A utility that enhances `isCI` from 'ci-info` with support for ZEIT's Now and Heroku detection

```js
const { isCI } = require("gatsby-core-utils")

if (isCI()) {
  // execute CI-specific code
}
// ...
```

### getCIName

A utility that returns the name of the current CI environment if available, `null` otherwise

```js
const { getCIName } = require("gatsby-core-utils")

const CI_NAME = getCIName()
console.log({ CI_NAME })
// {CI_NAME: null}, or
// {CI_NAME: "ZEIT Now"}
// ...
```
