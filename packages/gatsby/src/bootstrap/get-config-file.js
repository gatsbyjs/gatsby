/* @flow */
const levenshtein = require('fast-levenshtein');
const fs = require('fs-extra');
const testRequireError = require(`../utils/test-require-error`);
const report = require(`gatsby-cli/lib/reporter`);

function isNearMatch(fileName: string, configName: string, distance: number): boolean {
  return levenshtein.get(fileName, configName) <= distance;
}

module.exports = async function getConfigFile(rootDir: string, configName: string, distance: number = 3) {
  const configPath = `${rootDir}/${configName}`;
  try {
    return require(configPath);
  } catch (err) {
    const nearMatch = await fs.readdir(rootDir)
      .then(files => {
        return files
          .find(file => {
            const fileName = file.split(rootDir).pop();
            return isNearMatch(fileName, configName, distance);
          });
      });
    if (testRequireError(configPath, err)) {
      if (nearMatch) {
        report.info(`The file ${nearMatch} looks like ${configName}, please rename.`);
      }
      report.error(`Could not load ${configName}`, err);
      process.exit(1);
    }
  }
};
