# get-npm-dependencies-for-file

Analyze a file's requires/imports with [precinct](https://github.com/dependents/node-precinct) and returns an array of NPM dependencies.

Typescript, ES6, and commonjs modules are all supported.

## Install

`npm i get-npm-dependencies-for-file`

## Usage

```js
const path = require(`path`)
const getDependencies = require(`get-npm-dependencies-for-file`)
const dependencies = findDependencies(path.resolve(__dirname, `./a-file.js`))

// dependencies looks something like [{ name: "glob", version: "7.1.7" }]
```
