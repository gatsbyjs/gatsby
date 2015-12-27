import path from 'path';
import fs from 'fs';

module.exports = (config, env) => {
  const gatsbyConfig = path.resolve(process.cwd(), './gatsby.config.js');
  if (fs.existsSync(gatsbyConfig)) {
    return require(gatsbyConfig)(config, env);
  }

  return config
};
