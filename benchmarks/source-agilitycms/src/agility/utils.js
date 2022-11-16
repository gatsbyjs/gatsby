const buildPageViewModel = ({ pageContext, data }) => {

	const page = JSON.parse(data.agilitypage.pageJson);

	if (data.agilityPost) {
		//replace the title with the title of the post
		page.title = data.agilityPost.customFields.title;
	}


	//build the our viewModel
	return {
		page: page,
		dynamicPageItem: data.agilityPost,
		isPreview: pageContext.isPreview,
		languageCode: pageContext.languageCode,
		isMultiLanguage: pageContext.isMultiLanguage
	}
}

const getLinkedContentItem = ({ type, linkedContentFieldName }) => {
	const fieldResolver =
	{
		//we are telling it is going to return the 'agilityAuthor' node type
		type: type,
		//this is the function that is going to resolve it
		resolve: async (source, args, context, info) => {
			//query the graphql nodes to find the item you want to return
			const node = context.nodeModel.runQuery({
				//find the author that matches our ID and language code
				query: {
					filter: {
						contentID: { eq: source.customFields[linkedContentFieldName].contentid },
						languageCode: { eq: source.languageCode }
					}
				},
				type: type,
				//tell it to stop searching once we found our item
				firstOnly: true,
			})
			return node;
		}
	}
	return fieldResolver;
}

const getLinkedContentList = ({ type, linkedContentFieldName }) => {
	const fieldResolver =
	{
		type: [type],
		resolve: async (source, args, context, info) => {
			const { entries } = await context.nodeModel.findAll({ type })
			const filteredList = entries.filter(
				item => item.properties.referenceName === source.customFields[linkedContentFieldName].referencename
			)
			return Array.from(filteredList);
		}
	}

	return fieldResolver;
}

const getDynamicPageItemSitemapNode = () => {
	const fieldResolver =
	{
		type: 'agilitySitemapNode',
		resolve: async (source, args, context, info) => {
			const node = context.nodeModel.runQuery({
				query: {
					filter: {
						contentID: { eq: source.contentID },
						languageCode: { eq: source.languageCode }
					}
				},
				type: `agilitySitemapNode`,
				firstOnly: true
			})
			return node;
		}
	}

	return fieldResolver;
}

const renderHTML = (html) => {
	return { __html: cleanHTML(html) };
}

const cleanHTML = (html) => {
	//fix '~' in links in HTML
	return html.replace(/href="~\//gi, 'href="/')
}

module.exports = {
	buildPageViewModel,
	getLinkedContentList,
	getDynamicPageItemSitemapNode,
	getLinkedContentItem,
	renderHTML,
	cleanHTML
}