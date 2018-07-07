import fs from 'fs';
import robotsTxt from 'generate-robotstxt';
import path from 'path';
import url from 'url';

const publicPath = './public';
const query = `{
  site {
    siteMetadata {
      siteUrl
    }
  }
}
`;
const defaultEnv = 'development';

function writeFile(file, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(file, data, err => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

function runQuery(handler, query) {
  return handler(query).then(res => {
    if (res.errors) {
      throw new Error(res.errors.join(', '));
    }

    return res.data;
  });
}

const getOptions = pluginOptions => {
  const options = { ...pluginOptions };

  delete options.plugins;

  const { env = {}, resolveEnv = () => process.env.NODE_ENV } = options;

  const envOptions = env[resolveEnv()] || env[defaultEnv] || {};

  delete options.env;
  delete options.resolveEnv;

  return { ...options, envOptions };
};

export async function onPostBuild({ graphql }, pluginOptions) {
  const userOptions = getOptions(pluginOptions);

  const defaultOptions = {
    output: '/robots.txt'
  };

  const mergedOptions = { ...defaultOptions, ...userOptions };

  if (
    !mergedOptions.hasOwnProperty('host') ||
    !mergedOptions.hasOwnProperty('sitemap')
  ) {
    const {
      site: {
        siteMetadata: { siteUrl }
      }
    } = await runQuery(graphql, query);

    mergedOptions.host = siteUrl;
    mergedOptions.sitemap = url.resolve(siteUrl, 'sitemap.xml');
  }

  const { policy, sitemap, host, output } = mergedOptions;

  const content = await robotsTxt({
    policy,
    sitemap,
    host
  });
  const filename = path.join(publicPath, output);

  return await writeFile(path.resolve(filename), content);
}
