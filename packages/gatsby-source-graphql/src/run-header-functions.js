module.exports = async headers =>
  Promise.all(
    Object.keys(headers).map(async name =>
      typeof headers[name] === `function`
        ? { [name]: await headers[name]() }
        : { [name]: headers[name] }
    )
  ).then(arr => arr.reduce((acc, cur) => Object.assign(acc, cur), {}))
