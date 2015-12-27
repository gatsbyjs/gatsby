require('node-cjsx').transform();
import webpack from 'webpack';
import globPages from './glob-pages';
import webpackConfig from './webpack.config';
import getUserGatsbyConfig from './get-user-gatsby-config';

var debug = require('debug')('gatsby:static');

module.exports = function(program, callback) {
	var {relativeDirectory, directory} = program;

	return globPages(directory, function(err, pages) {
		debug('generating static site');
		var routes = pages.filter(function(page) { return (page.path != null); }).map(function(page) { return page.path; });

		var compilerConfig = webpackConfig(program, directory, 'static', null, routes);
		var config = getUserGatsbyConfig(compilerConfig, 'static');

		return webpack(config.resolve()).run(function(err, stats) {
			if (err) {
				return callback(err, stats);
			}
			if (stats.hasErrors()) {
				return callback('Error: ' + stats.toJson().errors, stats);
			}
			return callback(null, stats);
		});
	});
};
