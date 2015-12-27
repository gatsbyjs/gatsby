import webpack from 'webpack';
import webpackConfig from  './webpack.config';
import getUserGatsbyConfig from './get-user-gatsby-config';

module.exports = function(program, callback) {
	var {relativeDirectory, directory} = program;

	var compilerConfig = webpackConfig(program, directory, 'production');
	var config = getUserGatsbyConfig(compilerConfig, 'production');

	return webpack(config.resolve()).run(function(err, stats) {
		return callback(err, stats);
	});
};