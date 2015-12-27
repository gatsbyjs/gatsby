var Router = require('react-router');
var filter = require('lodash/collection/filter');
var sortBy = require('lodash/collection/sortBy');
var last = require('lodash/array/last');
var includes = require('underscore.string/include');
var { config } = require('config');
var { link } = require('./gatsby-helpers');

module.exports = function (pages, pagesReq) {
	var templates = {};
	templates.root = Router.createRoute({
		name: 'root-template',
		path: link("/"),
		handler: pagesReq('./_template')
	});

	// Arrange pages in data structure according to their position
	// on the file system. Then use this to create routes.
	//
	// Algorithm
	// 1. Find all templates.
	// 2. Create routes for each template russian-doll style.
	// 3. For each index file paired with a template, create a default route
	// 4. Create normal routes for each remaining file under the appropriate template
	var templateFiles = filter(pages, function (page) {
		return page.file.name === "_template" && page.file.dirname !== ".";
	});

	for (var i = 0, templateFile; i < templateFiles.length; i++) {
		//Find the parent template of this template.
		templateFile = templateFiles[i];
		var parentTemplates = filter(templateFiles, function (template) {
				return includes(templateFile.requirePath, template.file.dirname);
			}
		);
		parentTemplates = sortBy(parentTemplates, function (template) {
			return ((typeof template !== "undefined" && template !== null) ? template.file : undefined).dirname.length;
		});
		var parentTemplateFile = last(parentTemplates);
		var parentRoute = templates[((typeof parentTemplateFile !== "undefined" && parentTemplateFile !== null) ? parentTemplateFile.file : undefined).dirname];

		if (!parentRoute) {
			parentRoute = templates.root;
		}

		templates[templateFile.file.dirname] = Router.createRoute({
			name: templateFile.file.dirname + "-template",
			path: link(templateFile.templatePath),
			parentRoute: parentRoute,
			handler: pagesReq("./" + templateFile.requirePath)
		});
	}
	// Remove files that start with an underscore as this indicates the file shouldn't be turned into a page.
	var filteredPages = filter(pages, function (page) {
		return page.file.name.slice(0, 1) !== '_';
	});

	var markdownWrapper = require('wrappers/md');
	var htmlWrapper = require('wrappers/html');

	for (var j = 0, page; j < filteredPages.length; j++) {
		// TODO add ways to load data for other file types.
		// Should be able to install a gatsby-toml plugin to add support for TOML.
		// Perhaps everything other than JSX and Markdown should be plugins.
		// Or even they are plugins but they have built-in "blessed" plugins.
		page = filteredPages[j];
		switch (page.file.ext) {
			case "md":
				var handler = markdownWrapper;
				page.data = pagesReq("./" + page.requirePath);
				break;
			case "html":
				handler = htmlWrapper;
				break;
			case "jsx":
				handler = pagesReq("./" + page.requirePath);
				page.data = (() => {
					if (pagesReq("./" + page.requirePath).metadata) {
						return pagesReq("./" + page.requirePath).metadata();
					}
				})();
				break;
			default:
				handler = pagesReq("./" + page.requirePath);
		}
		// Determine parent template for page.
		var parentRoutes = filter(templateFiles, function (templateFile) {
				return includes(page.requirePath, templateFile.file.dirname);
			}
		);
		parentRoutes = sortBy(parentRoutes, function (route) {
			return ((typeof route !== "undefined" && route !== null) ? route.file : undefined).dirname.length;
		});
		parentTemplateFile = last(parentRoutes);
		parentRoute = templates[((typeof parentTemplateFile !== "undefined" && parentTemplateFile !== null) ? parentTemplateFile.file : undefined).dirname];

		if (!parentRoute) {
			parentRoute = templates.root;
		}
		// If page is an index page *and* in the same directory as a template, it is the default route (for that template).
		if (includes(page.path, "/index") && parentRoute.file.dirname === parentTemplateFile.file.dirname) {
			Router.createDefaultRoute({
				name: page.path,
				parentRoute: parentRoute,
				handler: handler
			});
		} else {
			Router.createRoute({
				name: page.path,
				path: link(page.path),
				parentRoute: parentRoute,
				handler: handler
			});
		}
	}

	return templates.root;
};
