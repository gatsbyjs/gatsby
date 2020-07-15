import React from 'react'

const AgilityPageTemplate = (props) => {
	const pageTemplateName = props.page.templateName.replace(/[^0-9a-zA-Z]/g, '');
	const PageTemplateComponentToRender = require(`../../pageTemplates/${pageTemplateName}.js`).default;

	//get the page template name that we need to render

	//const PageTemplateComponentToRender = props.pageTemplates[pageTemplateName];
	delete props.pageTemplates;
	return (
		<PageTemplateComponentToRender {...props} />
	);
}

export default AgilityPageTemplate;
