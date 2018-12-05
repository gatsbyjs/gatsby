/**
 * Lets plugins configure themselves when the `add` or `config` commands are run using the `gatsby plugin` CLI.
 * @param {Object} $0
 * @param {function} $0.prompt - Takes Array of questions to promt Dev to answer. Function from Inquirer.js to prompt user for answers.
 * @param {Object} existingConfig - The current config from the project's `gatsby-config.js`
 * @example
 * exports.onConfigurePlugin = ({ prompt }, existingConfig) => {
 *    // Define the information that’s needed.
 * 	  const questions = [
 *      {
 * 			  // This would match the config option name.
 * 			  name: 'apiKey',
 * 			  message: 'API key for <source>',
 * 	      type: 'input',
 *      },
 *    ];
 *
 *    // Ask for the input.
 *    const answers = await prompt(questions);
 *
 *    // Optional: process the answers and/or add additional config.
 * 	  const updatedConfig = doStuffWithAnswers(answers);
 *
 *    // Return the config object, which the CLI will insert into `gatsby-config.js`
 *    // NOTE: This would probably need some thought (e.g. how do we delete options?)
 *    return {
 *	    ...existingConfig,
 *	    ...updatedConfig,
 *    };
 * }
 */
exports.onConfigurePlugin = true
