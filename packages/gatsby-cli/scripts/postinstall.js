const chalk = require('chalk');

const showSuccessMessage = () => {
    console.log(chalk.green('Success!\n'));
    console.log(chalk.cyan('Welcome to the Gatsby CLI! Please visit ') + 
        chalk.bgCyan('https://www.gatsbyjs.org/docs/gatsby-cli/') + 
        chalk.cyan(' for more information.\n'));
}

try{
    const createCli = require('../lib/create-cli');
    showSuccessMessage();
    createCli('--help');
}catch(e){
    showSuccessMessage();
}
