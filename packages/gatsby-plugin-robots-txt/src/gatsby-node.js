import fs from 'fs';
import url from 'url';
import path from 'path';
import robotsTxt from 'generate-robotstxt';

const publicPath = './public';
const query = `{
  site {
    siteMetadata {
      siteUrl
    }
  }
}
`;

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

export async function onPostBuild({ graphql }, pluginOptions) {
  const options = { ...pluginOptions };

  delete options.plugins;

  const { site: { siteMetadata: { siteUrl } = {} } = {} } = await runQuery(
    graphql,
    query
  );
  const defaultOptions = {
    output: '/robots.txt',
    host: siteUrl,
    sitemap: siteUrl && url.resolve(siteUrl, 'sitemap.xml')
  };
  const { policy, sitemap, host, output } = { ...defaultOptions, ...options };
  const content = await robotsTxt({
    policy,
    sitemap,
    host
  });
  const filename = path.join(publicPath, output);

  return await writeFile(filename, content);
}
