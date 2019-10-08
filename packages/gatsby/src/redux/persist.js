const v8 = require(`v8`)
const fs = require(`fs-extra`)

const file = `${process.cwd()}/.cache/redux.state`

const readFromCache = () => v8.deserialize(fs.readFileSync(file))

const writeToCache = contents => {
    Object.keys(contents).forEach(key => {
        if (contents[key] instanceof Map) {
        const obj = {};
        contents[key].forEach ((v,k) => { obj[k] = v });
        contents[key] = obj;
        }
    });
    return fs.writeFileSync(file, JSON.stringify({pages: contents.pages, webpackCompilationHashOld: contents.webpackCompilationHash}), "utf-8");
}

module.exports = { readFromCache, writeToCache }
