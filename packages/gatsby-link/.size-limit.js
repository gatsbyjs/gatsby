module.exports = [
  {
    path: require(`./package.json`).main,
    webpack: false,
    limit: `2.5kb`,
  },
]
