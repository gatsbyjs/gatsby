const splitPackageName = dependency => {
  if (dependency.substr(1).includes(`@`)) {
    const splitIndex = dependency.lastIndexOf(`@`)
    const name = dependency.substr(0, splitIndex)
    const version = dependency.substr(splitIndex + 1)
    return [name, version]
  } else {
    return [dependency, null]
  }
}

module.exports = { splitPackageName }
