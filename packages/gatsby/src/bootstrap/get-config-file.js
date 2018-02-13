/* @flow */
const levenshtein = require('fast-levenshtein');
const fs = require('fs-extra');
const testRequireError = require(`../utils/test-require-error`);
const report = require(`gatsby-cli/lib/reporter`);
const chalk = require('chalk');

function isNearMatch(fileName: string, configName: string, distance: number): boolean {
  return levenshtein.get(fileName, configName) <= distance;
}

function failAndExit(configName, err) {
  report.error(`Could not load ${configName}`, err);
  process.exit(1);
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
    if (!testRequireError(configPath, err)) {
      failAndExit(configName, err);
    } else if (nearMatch) {
      console.log('');
      report.info(`It looks like you were trying to add the config file? Please rename "${chalk.bold(nearMatch)}" to "${chalk.bold(configName)}"`);
      console.log('');
      failAndExit(configName, err);
    }
  }
};
