import React from 'react';


const ContentZone = ({ name, page, dynamicPageItem }) => {

	const Modules = () => {
		let modules = []
		const modulesForThisContentZone = page.zones[name];

		if (modulesForThisContentZone === undefined) {
			console.error(`Cannot render modules for zone "${name}". This does not appear to be a valid content zone for this page template.`)
			return;
		}

		modulesForThisContentZone.forEach(moduleItem => {
			if (moduleItem.item) {
				const moduleDefName = moduleItem.item.properties.definitionName;
				const ModuleComponentToRender = require(`../../modules/${moduleDefName}.js`).default;
				const moduleProps = {
					key: moduleItem.item.contentID,
					dynamicPageItem: dynamicPageItem,
					item: moduleItem.item
				}

				if (ModuleComponentToRender) {
					modules.push(<ModuleComponentToRender {...moduleProps} />)
				} else {
					console.error(`No react component found for the module "${moduleDefName}". Cannot render module.`);
				}
			}
		})

		return modules;
	}

	return (<Modules />)
}
export default ContentZone;