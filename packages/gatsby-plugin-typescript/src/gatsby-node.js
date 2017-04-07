import { transpileModule } from "typescript";

const test = /\.tsx?$/;
const compilerDefaults = {
  target: "esnext",
  experimentalDecorators: true,
  jsx: "react",
};

export function resolvableExtensions(ctx) {
  return [".ts", ".tsx"];
}

export function modifyWebpackConfig(ctx) {
  const { args: { config }, pluginOptions: { compilerOptions } } = ctx;
  // CommonJS to keep Webpack happy.
  const copts = Object.assign(compilerDefaults, compilerOptions, {
    module: "commonjs",
  });
  // React-land is rather undertyped; nontrivial TS projects will most likely
  // error (i.e., not build) at something or other.
  const opts = { compilerOptions: copts, transpileOnly: true };
  // Load TypeScript files with ts-loader. This'll need to be installed (along with TypeScript)
  // in the project directory.
  config.loader("typescript", {
    test,
    loader: "ts-loader?" + JSON.stringify(opts),
  });
}

export function preprocessSource(ctx) {
  const {
    args: { contents, filename },
    pluginOptions: { compilerOptions },
  } = ctx;
  // overwrite defaults with custom compiler options
  const copts = Object.assign(compilerDefaults, compilerOptions, {
    target: "esnext",
    module: "es6",
  });
  // return the transpiled source if it's TypeScript, otherwise null
  return test.test(filename)
    ? transpileModule(contents, { compilerOptions: copts }).outputText
    : null;
}
