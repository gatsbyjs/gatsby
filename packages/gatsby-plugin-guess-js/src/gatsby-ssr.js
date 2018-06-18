const _ = require(`lodash`);
const nodePath = require(`path`);
const fs = require(`fs`);
const React = require(`react`);

const { guess } = require(`guess-webpack/api`);

function urlJoin(...parts) {
  return parts.reduce((r, next) => {
    const segment = next == null ? `` : String(next).replace(/^\/+/, ``);
    return segment ? `${r.replace(/\/$/, ``)}/${segment}` : r;
  }, ``);
}

let pd = [];
const readPageData = () => {
  if (pd.length > 0) {
    return pd;
  } else {
    pd = JSON.parse(fs.readFileSync(nodePath.join(process.cwd(), `.cache`, `data.json`)));
    return pd;
  }
};

let s;
const readStats = () => {
  if (s) {
    return s;
  } else {
    s = JSON.parse(fs.readFileSync(`${process.cwd()}/public/webpack.stats.json`, `utf-8`));
    return s;
  }
};

exports.onRenderBody = ({ setHeadComponents, pathname, pathPrefix }, pluginOptions) => {
  if (process.env.NODE_ENV === `production`) {
    const pagesData = readPageData();
    const stats = readStats();
    const matchedPaths = Object.keys(guess({ path: pathname, threshold: pluginOptions.minimumThreshold }));
    if (!_.isEmpty(matchedPaths)) {
      const matchedPages = matchedPaths.map(match => _.find(pagesData.pages, page => page.path === match));
      let componentUrls = [];
      matchedPages.forEach(p => {
        if (p && p.componentChunkName) {
          const fetchKey = `assetsByChunkName[${p.componentChunkName}]`;
          let chunks = _.get(stats, fetchKey);
          componentUrls = [...componentUrls, ...chunks];
        }
      });
      componentUrls = _.uniq(componentUrls);
      const components = componentUrls.map(c =>
        React.createElement(`Link`, {
          as: c.slice(-2) === `js` ? `script` : undefined,
          rel: c.slice(-2) === `js` ? `prefetch` : `prefetch alternate stylesheet`,
          key: c,
          href: urlJoin(pathPrefix, c)
        })
      );

      setHeadComponents(components);
    }

    return true;
  }
  return false;
};
