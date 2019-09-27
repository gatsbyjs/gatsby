const fs = require(`fs-extra`)
const path = require(`path`)
const Promise = require(`bluebird`)
const _ = require(`lodash`);

const getFilePath = ({ publicDir }, pagePath) => {
  const fixedPagePath = pagePath === `/` ? `index` : pagePath
  return path.join(publicDir, `page-data`, fixedPagePath, `page-data.json`)
}
const read = async ({ publicDir }, pagePath) => {
  const filePath = getFilePath({ publicDir }, pagePath)
  const rawPageData = await fs.readFile(filePath, `utf-8`)
  return JSON.parse(rawPageData)
}

const write = async ({ publicDir }, page, result, webpackCompilationHash) => {
  const filePath = getFilePath({ publicDir }, page.path)
  const body = {
    componentChunkName: page.componentChunkName,
    path: page.path,
    matchPath: page.matchPath,
    webpackCompilationHash,
    result,
  }
  await fs.outputFile(filePath, JSON.stringify(body))
}

const updateCompilationHashes = (
  { publicDir, workerPool },
  pagePaths,
  webpackCompilationHash
) => {
  const segments = _.chunk(pagePaths, 50)
  return Promise.map(segments, segment =>
    workerPool.updateCompilationHashes(
      { publicDir },
      segment,
      webpackCompilationHash
    )
  )
}

  // Compare page data sets.
  // TODO: logic to remove old pages.
const getNewPageKeys = (directory, store) => {
  return new Promise(resolve => {

    // check if old data set is available else return all page keys
    if(!(fs.existsSync(`${directory}/temp/redux-state-old.json`))) {
      console.log("Return all pages")
      resolve([...store.getState().pages.keys()]);
      return;
    }

    const newPageKeys = [];
    const newPageData = Object.assign({}, store.getState());
    const previousPageData = require(`${directory}/temp/redux-state-old.json`);

    // change pages map into object
    Object.keys(newPageData).forEach(key => {
      if (newPageData[key] instanceof Map) {
        const obj = {};
        newPageData[key].forEach ((v,k) => { obj[k] = v });
        newPageData[key] = obj;
      }
    });

    console.log("Start comparing page data")
    _.forEach(newPageData.pages, (value, key) => {
      if(!(key in previousPageData)) {
        newPageKeys.push(key);
      } else {
        const newPageContext = value.context.page;
        const previousPageContext = previousPageData[key].context.page;

        if ( !_.isEqual(newPageContext, previousPageContext) ) {
          newPageKeys.push(key);
        }
      }
    });

    // This was used for debugging
    // if (_.size(newPageKeys)) {
    //   fs.writeFileSync(`${directory}/temp/newPageKeys.json`, JSON.stringify({ newPageKeys }), "utf-8");
    //   console.log("file of newPageKeys created");
    // }

    console.log("Finished");
    console.log(newPageKeys)
    resolve(newPageKeys);
  });
}


module.exports = {
  read,
  write,
  updateCompilationHashes,
  getNewPageKeys,
}
