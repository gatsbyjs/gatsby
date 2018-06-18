const { guess } = require(`guess-webpack/api`);

exports.disableCorePrefetching = () => true;

let initialPath;
let notNavigated = true;
exports.onRouteUpdate = ({ location }) => {
  if (initialPath !== location.pathname) {
    notNavigated = false;
    return;
  }
  initialPath = location.pathname;
};

let chunksPromise;
const chunks = () => {
  if (!chunksPromise) {
    chunksPromise = fetch(`${window.location.origin}/webpack.stats.json`).then(res => res.json());
  }

  return chunksPromise;
};

let hasPrefetched = {};
const prefetch = url => {
  if (hasPrefetched[url]) {
    return;
  }
  hasPrefetched[url] = true;
  const link = document.createElement(`link`);
  link.setAttribute(`rel`, `prefetch`);
  link.setAttribute(`href`, url);
  const parentElement = document.getElementsByTagName(`head`)[0] || document.getElementsByName(`script`)[0].parentNode;
  parentElement.appendChild(link);
};

exports.onPrefetchPathname = ({ pathPrefix }, pluginOptions) => {
  if (process.env.NODE_ENV === `production`) {
    const matchedPaths = Object.keys(
      guess({ path: window.location.pathname, threshold: pluginOptions.minimumThreshold })
    );

    // Don't prefetch from client for the initial path as we did that
    // during SSR
    if (notNavigated && initialPath === window.location.pathname) {
      return;
    }

    if (matchedPaths.length > 0) {
      matchedPaths.forEach(p => {
        chunks(p).then(chunk => {
          // eslint-disable-next-line
          const page = ___loader.getPage(p);
          if (!page) return;
          let resources = [];
          if (chunk.assetsByChunkName[page.componentChunkName]) {
            resources = resources.concat(chunk.assetsByChunkName[page.componentChunkName]);
          }
          // eslint-disable-next-line
          resources.push(`static/d/${___dataPaths[page.jsonName]}.json`);
          // TODO add support for pathPrefix
          resources.forEach(r => prefetch(`/${r}`));
        });
      });
    }
  }
};
