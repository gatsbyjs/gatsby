import glob from 'glob';
import path from 'path';
import parsePath from 'parse-filepath';
import fs from 'fs';
import frontMatter from 'front-matter';
import _ from 'underscore';
import toml from 'toml';

var debug = require('debug')('gatsby:glob');

module.exports = function(directory, callback) {
	// Read in site config.
	try {
		var siteConfig = toml.parse(fs.readFileSync(directory + "/config.toml"));
	} catch (error) {
	}

	var pagesData = [];

	var app = require(directory + "/app");

	// Make this easy to add to through the config?
	// Or just keep adding extensions...?
	return glob(directory + '/pages/**/?(*.coffee|*.cjsx|*.jsx|*.js|*.md|*.html)', null, (err, pages) => {
		if (err) { return callback(err); }

		for (var i = 0, page; i < pages.length; i++) {
			page = pages[i];
			var parsed;
			var ext;
			var pageData = {};
			pageData.file = {};

			pageData.file = parsed = parsePath(path.relative(directory + "/pages", page));

			pageData.file.ext = ext = parsed.extname.slice(1);

			// Determine require path
			var relativePath = path.relative(directory, page);
			pageData.requirePath = path.relative(directory + "/pages", page);

			// Load data for each file type.
			if (ext === "md") {
				var rawData = frontMatter(fs.readFileSync(page, 'utf-8'));
				var data = _.extend({}, rawData.attributes);
				pageData.data = data;
			} else if (ext === "html") {
				pageData.data = fs.readFileSync(page, 'utf-8');
			} else {
				data = {};
			}

			// Determine path for page (unless it's a file that starts with an
			// underscore as these don't become pages).
			if (!(parsed.name.slice(0,1) === "_")) {
				if (data.path) {
					// Path was hardcoded.
					pageData.path = data.path;
				} else if (app.rewritePath) {
					pageData.path = app.rewritePath(parsed, pageData);
				}

				// If none of the above options set a path.
				if (!(pageData.path != null)) {
					// If this is an index page or template, it's path is /foo/bar/
					if (parsed.name === "index" || parsed.name === "template") {
						if (parsed.dirname === ".") {
							pageData.path = "/";
						} else {
							pageData.path = "/" + parsed.dirname + "/";
						}
						// Else if not an index, create a path like /foo/bar/
						// and rely upon static-site-generator-webpack-plugin to add index.html
					} else {
						if (parsed.dirname === ".") {
							pageData.path = "/" + parsed.name + "/";
						} else {
							pageData.path = "/" + parsed.dirname + "/" + parsed.name + "/";
						}
					}
				}

				// Set the "template path"
			} else if (parsed.name === "_template") {
				pageData.templatePath = "/" + parsed.dirname + "/";
			}

			pagesData.push(pageData);
		}

		return debug('globbed', pagesData.length, 'pages'),
			callback(null, pagesData);
	});
};
