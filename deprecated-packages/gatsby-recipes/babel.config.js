module.exports = api => {
  const isTest = api.env(`test`)

  return {
    presets: [
      [
        `@babel/env`,
        {
          // use ES modules for rollup and commonjs for jest
          modules: isTest ? `commonjs` : false,
          shippedProposals: true,
          targets: {
            node: `10.13.0`,
          },
        },
      ],
      `@babel/preset-react`,
    ],
    plugins: [`@babel/plugin-transform-runtime`],
  }
}
