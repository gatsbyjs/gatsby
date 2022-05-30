
import transform from './transform'

let babel;
try {
  babel = require("@babel/core");
} catch (err) {
  if (err.code === "MODULE_NOT_FOUND") {
    err.message +=
      "\n babel-loader@8 requires Babel 7.x (the package '@babel/core'). " +
      "If you'd like to use Babel 6.x ('babel-core'), you should install 'babel-loader@7'.";
  }
  throw err;
}

// Since we've got the reverse bridge package at @babel/core@6.x, give
// people useful feedback if they try to use it alongside babel-loader.
if (/^6\./.test(babel.version)) {
  throw new Error(
    "\n babel-loader@8 will not work with the '@babel/core@6' bridge package. " +
      "If you want to use Babel 6.x, install 'babel-loader@7'.",
  );
}

async function gatsbyBabelLoader(
  this: any,
  inputSource: string,
  inputSourceMap: object | null | undefined,
  overrides, // TODO use these!
) {
  const filename = this.resourcePath
  const target = this.target
  const loaderOptions = () => this.getOptions()

  const { code: transformedSource, map: outputSourceMap } = transform.call(
    this,
    inputSource,
    inputSourceMap,
    loaderOptions,
    filename,
    target,
    overrides,
  )

  return [transformedSource, outputSourceMap]
}

function makeLoader(callback?) {
  const overrides = callback ? callback(babel) : undefined;
  console.log({overrides})

  return function (source, inputSourceMap) {
    // Make the loader async
    // @ts-ignore
    const callback = this.async();

    // @ts-ignore
    gatsbyBabelLoader.call(this, source, inputSourceMap, overrides).then(
      args => callback(null, ...args),
      err => callback(err),
    );
  };
}

const loader = makeLoader()

export default loader
export const custom = makeLoader
