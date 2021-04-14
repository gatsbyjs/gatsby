import React from 'react'

const AgilityPageTemplate = (props) => {
	const pageTemplateName = props.page.templateName.replace(/[^0-9a-zA-Z]/g, '');
	const PageTemplateComponentToRender = require(`../../pageTemplates/${pageTemplateName}.js`).default;

	delete props.pageTemplates;
	return (
		<PageTemplateComponentToRender {...props} />
	);
}

export default AgilityPageTemplate;
